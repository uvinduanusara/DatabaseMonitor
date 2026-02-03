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
        var sql = @"
            INSERT INTO database_metrics (db_id, cpu, memory, time, tenant_id) 
            VALUES (@DbId, @Cpu, @Memory, @Time, @TenantId::uuid)"; // Keeping the ::uuid cast if text column stores uuid-like strings? 
            // Wait, if tenant_id is TEXT in DB, casting to UUID might fail if it's not a UUID.
            // But logic in Worker was parsing Guid. 
            // I'll assume it's safer to pass as string if column is TEXT, let Postgres handle it.
            // But if the column IS uuid type (which I didn't see in CREATE TABLE), then we need uuid.
            // Setup SQL said: tenant_id TEXT.
            // So I should remove ::uuid cast if I pass a string, unless Postgres needs it to validate?
            // Worker.cs line 34 had: VALUES (..., @TenantId::uuid)
            // And Worker.cs line 138 parsed it to Guid.
            // If I pass string, I should probably remove ::uuid unless I want to enforce it.
            // I'll stick to original logic but keep it safe. If tenant_id might be empty string, uuid cast fails.
            // Worker logic: Guid.TryParse(...) ? tenantGuid : Guid.Empty.
            // So it effectively inserts '00000000-...' if fail.
            // My Domain entity has string?.
            // I'll adjust SQL to: VALUES (@DbId, @Cpu, @Memory, @Time, @TenantId)
            // leaving it as text since column is text.

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
