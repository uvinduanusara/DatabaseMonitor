using Dapper;
using Microsoft.Extensions.Configuration;
using Monitor.Domain.Entities;
using Monitor.Domain.Interfaces;
using Npgsql;

namespace Monitor.Infrastructure.Persistence;

public class MetricRepository : IMetricRepository
{
    private readonly string _connectionString;

    public MetricRepository(IConfiguration configuration)
    {
        _connectionString = configuration["DATABASE_CONNECTION_STRING"] 
                            ?? Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING") 
                            ?? "";
    }

    public async Task AddMetricAsync(DatabaseMetric metric)
    {
        using var conn = new NpgsqlConnection(_connectionString);

        var sqlRevised = @"
            INSERT INTO database_metrics (db_id, cpu, memory, time, tenant_id) 
            VALUES (@DbId, @Cpu, @Memory, @Time, @TenantId::uuid)";
            
        await conn.ExecuteAsync(sqlRevised, metric);
    }

    public async Task<IEnumerable<dynamic>> GetMetricsByUserAsync(string userId, TimeSpan since)
    {
        using var conn = new NpgsqlConnection(_connectionString);
        var sql = @"
            SELECT 
                m.db_id,
                d.name,
                date_trunc('minute', m.time) AS time, 
                avg(m.cpu) as cpu, 
                avg(m.memory) as memory
            FROM database_metrics m 
            JOIN monitored_databases d ON m.db_id = d.id 
            WHERE d.user_id = @UserId AND m.time > now() - @Interval
            GROUP BY m.db_id, d.name, date_trunc('minute', m.time)
            ORDER BY time ASC";

        return await conn.QueryAsync(sql, new { UserId = userId, Interval = since });
    }
}
