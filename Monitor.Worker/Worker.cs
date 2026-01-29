using Dapper;
using Npgsql;

namespace Monitor.Worker;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    // Our Docker Postgres Connection String
    private readonly string _connectionString = "Host=localhost;Port=5433;Database=postgres;Username=saas_admin;Password=SaaS_Password_99";

    public Worker(ILogger<Worker> logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var masterConn = new NpgsqlConnection(_connectionString);

                // 1. Get the list of all databases we are supposed to watch
                var targets = await masterConn.QueryAsync<dynamic>(
                    "SELECT id, name, connection_string FROM monitored_databases WHERE is_active = true");

                foreach (var target in targets)
                {
                    try
                    {
                        using var targetConn = new NpgsqlConnection((string)target.connection_string);

                        // 1. Get Actual Connection Count
                        var conns = await targetConn.ExecuteScalarAsync<int>("SELECT count(*) FROM pg_stat_activity");

                        // 2. Get Actual Database Size in Megabytes (MB)
                        // This query looks at the current database size and converts bytes to MB
                        var sizeInMb = await targetConn.ExecuteScalarAsync<double>(
                            "SELECT pg_database_size(current_database()) / 1024.0 / 1024.0");

                        // 3. Save to our Master DB
                        var sqlMetric = @"INSERT INTO database_metrics (time, tenant_id, db_id, cpu_usage, mem_usage, connections) 
                        VALUES (@Time, @TenantId, @DbId, @Cpu, @Mem, @Conns)";

                        await masterConn.ExecuteAsync(sqlMetric, new
                        {
                            Time = DateTime.UtcNow,
                            TenantId = Guid.Empty,
                            DbId = (int)target.id,
                            Cpu = sizeInMb, // Storing MB size in the 'cpu_usage' column for now
                            Mem = 4.0,
                            Conns = conns
                        });

                        // 4. Alerting (e.g., Alert if DB size exceeds 500MB)
                        if (sizeInMb > 500.0)
                        {
                            _logger.LogWarning("!!! DISK ALERT: {name} is getting large: {size:F2} MB", (string)target.name, sizeInMb);
                            // ... (keep your existing alert insert code here)
                        }

                        _logger.LogInformation("Polled {name}: {size:F2} MB, {conns} Connections",
                            (string)target.name, sizeInMb, conns);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Failed to poll {name}: {msg}", (string)target.name, ex.Message);
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