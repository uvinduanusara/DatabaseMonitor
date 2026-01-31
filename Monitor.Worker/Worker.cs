using Dapper;
using Npgsql;
using StackExchange.Redis;
using System.Text.Json;
using MongoDB.Driver; // Added for MongoDB
using MongoDB.Bson;   // Added for MongoDB

namespace Monitor.Worker;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly string _connectionString = "Host=localhost;Port=5433;Database=postgres;Username=saas_admin;Password=SaaS_Password_99";

    public Worker(ILogger<Worker> logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // 1. ADDED tenant_id to the INSERT string
        const string sqlMetric = @"
    INSERT INTO database_metrics (db_id, cpu, memory, time, tenant_id) 
    VALUES (@DbId, @Cpu, @Memory, @Time, @TenantId::uuid)"; // Note the ::uuid cast

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var masterConn = new NpgsqlConnection(_connectionString);
                await masterConn.OpenAsync(stoppingToken);

                // 2. FETCH user_id from the master table
                var targets = await masterConn.QueryAsync<dynamic>(
                    "SELECT id, name, connection_string, db_type, user_id FROM monitored_databases WHERE is_active = true AND connection_string IS NOT NULL");

                foreach (var target in targets)
                {
                    string type = target.db_type?.ToString() ?? "Postgres";
                    string connStr = target.connection_string?.ToString() ?? "";

                    if (string.IsNullOrEmpty(connStr))
                    {
                        _logger.LogWarning("Skipping database {name}: connection string is null or empty", (string)target.name);
                        continue;
                    }

                    double cpu = 0;
                    double memory = 0;

                    try
                    {
                        if (type == "Postgres")
                        {
                            using var dbConn = new NpgsqlConnection(connStr);
                            await dbConn.OpenAsync(stoppingToken);

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

                        // 3. MAP the user_id to TenantId
                        await masterConn.ExecuteAsync(sqlMetric, new
                        {
                            Time = DateTime.UtcNow,
                            DbId = (int)target.id,
                            Cpu = cpu,
                            Memory = memory,
                            // Convert the string user_id to a Guid
                            TenantId = Guid.TryParse(target.user_id?.ToString(), out Guid tenantGuid)
                ? tenantGuid
                : Guid.Empty
                        });


                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Failed to poll {type} DB {name}: {msg}", type, (string)target.name, ex.Message);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("Master Loop Error: {message}", ex.Message);
            }

            await Task.Delay(10000, stoppingToken);
        }
    }
}