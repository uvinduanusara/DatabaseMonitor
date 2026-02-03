using Dapper;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace Monitor.Infrastructure.Persistence;

public class DbInitializer
{
    private readonly string _connectionString;

    public DbInitializer(IConfiguration configuration)
    {
        _connectionString = configuration["DATABASE_CONNECTION_STRING"] 
                            ?? Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING") 
                            ?? "";
    }

    public async Task InitializeAsync()
    {
        var setupSql = @"
            CREATE TABLE IF NOT EXISTS users (
                google_id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                name TEXT,
                picture TEXT,
                tenant_id TEXT
            );
            
            ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS picture TEXT;

            CREATE TABLE IF NOT EXISTS monitored_databases (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                connection_string TEXT NOT NULL,
                db_type TEXT NOT NULL,
                host TEXT DEFAULT '',
                is_active BOOLEAN DEFAULT TRUE,
                tenant_id TEXT,
                UNIQUE(name, user_id)
            );
            
            ALTER TABLE monitored_databases ADD COLUMN IF NOT EXISTS tenant_id TEXT;
            ALTER TABLE monitored_databases ADD COLUMN IF NOT EXISTS host TEXT DEFAULT '';

            CREATE TABLE IF NOT EXISTS database_metrics (
                db_id INTEGER REFERENCES monitored_databases(id) ON DELETE CASCADE,
                time TIMESTAMPTZ NOT NULL,
                cpu DOUBLE PRECISION,
                memory DOUBLE PRECISION,
                storage_usage DOUBLE PRECISION,
                tenant_id TEXT,
                UNIQUE(db_id, time)
            );
            
            ALTER TABLE database_metrics ADD COLUMN IF NOT EXISTS tenant_id TEXT;
            ALTER TABLE database_metrics ADD COLUMN IF NOT EXISTS storage_usage DOUBLE PRECISION;";

        for (int i = 1; i <= 5; i++)
        {
            try
            {
                Console.WriteLine($"🔍 Database Migration Attempt {i}...");
                using var conn = new NpgsqlConnection(_connectionString);
                await conn.ExecuteAsync(setupSql);
                Console.WriteLine("✅ Database Schema Verified/Created.");
                break; 
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Attempt {i} failed: {ex.Message}");
                if (i == 5) Console.WriteLine("❌ Final Migration Attempt Failed. App may crash on data requests.");
                else await Task.Delay(5000); 
            }
        }
    }
}
