using Dapper;
using Microsoft.Extensions.Logging;
using Monitor.Application.Interfaces;
using Monitor.Domain.Entities;
using Monitor.Domain.Interfaces;
using MongoDB.Bson;
using MongoDB.Driver;
using Npgsql;
using StackExchange.Redis;

namespace Monitor.Infrastructure.Services;

public class MonitoringService : IMonitoringService
{
    private readonly ILogger<MonitoringService> _logger;
    private readonly IMetricRepository _metricRepository;

    public MonitoringService(ILogger<MonitoringService> logger, IMetricRepository metricRepository)
    {
        _logger = logger;
        _metricRepository = metricRepository;
    }

    public async Task CheckAndSaveMetricsAsync(MonitoredDatabase target)
    {
        string type = target.DbType ?? "Postgres";
        string connStr = target.ConnectionString ?? "";

        if (string.IsNullOrEmpty(connStr))
        {
            _logger.LogWarning("Skipping database {name}: connection string is null or empty", target.Name);
            return;
        }

        double cpu = 0;
        double memory = 0;

        try
        {
            if (type == "Postgres")
            {
                using var dbConn = new NpgsqlConnection(connStr);
                await dbConn.OpenAsync();

                // Get database size in MB
                var sizeResult = await dbConn.QueryFirstOrDefaultAsync<dynamic>(
                    "SELECT pg_database_size(current_database()) / 1024 / 1024 as size_mb");
                memory = Convert.ToDouble(sizeResult?.size_mb ?? 0);

                // Get active connections
                var connResult = await dbConn.QueryFirstOrDefaultAsync<dynamic>(
                    "SELECT count(*) as conn_count FROM pg_stat_activity WHERE datname = current_database()");
                int activeConns = Convert.ToInt32(connResult?.conn_count ?? 0);

                // Estimate CPU based on active connections (as a percentage)
                cpu = Math.Min(activeConns * 5.0, 100.0); // 5% per connection, max 100%
            }
            else if (type == "MongoDB")
            {
                var client = new MongoClient(connStr);
                var database = client.GetDatabase("admin");

                var serverStatus = await database.RunCommandAsync<BsonDocument>(
                    new BsonDocument("serverStatus", 1));

                // Extract memory usage in MB
                if (serverStatus.TryGetValue("mem", out var memValue) && memValue is BsonDocument mem)
                {
                    memory = mem.TryGetValue("resident", out var resident) ? Convert.ToDouble(resident) : 0;
                }

                // Estimate CPU from connections
                if (serverStatus.TryGetValue("connections", out var connValue) && connValue is BsonDocument connections)
                {
                    int currentConns = connections.TryGetValue("current", out var current) ? Convert.ToInt32(current) : 0;
                    cpu = Math.Min(currentConns * 2.0, 100.0);
                }
            }
            else if (type == "Redis")
            {
                using var redis = ConnectionMultiplexer.Connect(connStr);
                var server = redis.GetServer(redis.GetEndPoints().First());

                var info = server.Info("memory");
                if (info.Length > 0)
                {
                    var memSection = info[0];
                    var usedMemoryItem = memSection.FirstOrDefault(x => x.Key == "used_memory");
                    if (!usedMemoryItem.Equals(default(KeyValuePair<string, string>)) && long.TryParse(usedMemoryItem.Value, out long usedMemory))
                    {
                        memory = usedMemory / (1024.0 * 1024.0); // Convert bytes to MB
                    }
                }

                var clientInfo = server.Info("clients");
                if (clientInfo.Length > 0)
                {
                    var clientSection = clientInfo[0];
                    var connectedClientsItem = clientSection.FirstOrDefault(x => x.Key == "connected_clients");
                    if (!connectedClientsItem.Equals(default(KeyValuePair<string, string>)) && int.TryParse(connectedClientsItem.Value, out int connectedClients))
                    {
                        cpu = Math.Min(connectedClients * 3.0, 100.0);
                    }
                }
            }

            // Save metrics
            var tenantIdString = target.TenantId;
            if (!Guid.TryParse(tenantIdString, out _))
            {
                tenantIdString = Guid.Empty.ToString();
            }

            await _metricRepository.AddMetricAsync(new DatabaseMetric
            {
                Time = DateTime.UtcNow,
                DbId = target.Id,
                Cpu = cpu,
                Memory = memory,
                TenantId = tenantIdString 
            });

        }
        catch (Exception ex)
        {
            _logger.LogError("Failed to poll {type} DB {name}: {msg}", type, target.Name, ex.Message);
        }
    }
}
