using Dapper;
using Microsoft.Extensions.Configuration;
using Monitor.Domain.Entities;
using Monitor.Domain.Interfaces;
using Npgsql;

namespace Monitor.Infrastructure.Persistence;

public class UserRepository : IUserRepository
{
    private readonly string _connectionString;

    public UserRepository(IConfiguration configuration)
    {
        _connectionString = configuration["DATABASE_CONNECTION_STRING"] 
                            ?? Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING") 
                            ?? "";
    }

    public async Task UpsertUserAsync(User user)
    {
        using var conn = new NpgsqlConnection(_connectionString);
        var sql = @"
            INSERT INTO users (email, google_id, name, picture, tenant_id) 
            VALUES (@Email, @GoogleId, @Name, @Picture, @TenantId) 
            ON CONFLICT (email) DO UPDATE 
            SET name = @Name, picture = @Picture, tenant_id = @TenantId";
        
        await conn.ExecuteAsync(sql, user);
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        using var conn = new NpgsqlConnection(_connectionString);
        var sql = "SELECT * FROM users WHERE email = @Email";
        return await conn.QueryFirstOrDefaultAsync<User>(sql, new { Email = email });
    }
}
