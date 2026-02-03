using Dapper;
using Microsoft.Extensions.Configuration;
using Monitor.Domain.Entities;
using Monitor.Domain.Interfaces;
using Npgsql;

namespace Monitor.Infrastructure.Persistence;

public class DatabaseRepository : IDatabaseRepository
{
    private readonly string _connectionString;

    public DatabaseRepository(IConfiguration configuration)
    {
        _connectionString = configuration["DATABASE_CONNECTION_STRING"] 
                            ?? Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING") 
                            ?? "";
    }

    public async Task<IEnumerable<MonitoredDatabase>> GetDatabasesByUserAsync(string userId)
    {
        using var conn = new NpgsqlConnection(_connectionString);
        var sql = @"SELECT id, user_id as UserId, name, connection_string as ConnectionString, db_type as DbType, is_active as IsActive, tenant_id as TenantId 
                    FROM monitored_databases WHERE user_id = @UserId AND is_active = true";
        return await conn.QueryAsync<MonitoredDatabase>(sql, new { UserId = userId });
    }

    public async Task<IEnumerable<MonitoredDatabase>> GetAllActiveDatabasesAsync()
    {
        using var conn = new NpgsqlConnection(_connectionString);
        var sql = @"SELECT id, user_id as UserId, name, connection_string as ConnectionString, db_type as DbType, is_active as IsActive, tenant_id as TenantId 
                    FROM monitored_databases WHERE is_active = true AND connection_string IS NOT NULL";
        return await conn.QueryAsync<MonitoredDatabase>(sql);
    }

    public async Task AddDatabaseAsync(MonitoredDatabase database)
    {
        using var conn = new NpgsqlConnection(_connectionString);
        var sql = @"INSERT INTO monitored_databases 
                    (name, db_type, connection_string, user_id, is_active, tenant_id) 
                    VALUES (@Name, @DbType, @ConnectionString, @UserId, true, @TenantId)";
        await conn.ExecuteAsync(sql, database);
    }

    public async Task DeleteDatabaseAsync(int id, string userId)
    {
        using var conn = new NpgsqlConnection(_connectionString);
        var sql = "DELETE FROM monitored_databases WHERE id = @Id AND user_id = @UserId";
        await conn.ExecuteAsync(sql, new { Id = id, UserId = userId });
    }
}
