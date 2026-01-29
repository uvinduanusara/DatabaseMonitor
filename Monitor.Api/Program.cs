using Dapper;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);
// Allow our future frontend to talk to this API
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();
app.UseCors();

// Our verified connection string
string connString = "Host=localhost;Port=5433;Database=postgres;Username=saas_admin;Password=SaaS_Password_99";

app.MapGet("/api/metrics", async () =>
{
    using var conn = new NpgsqlConnection(connString);
    var sql = @"
        SELECT m.time, m.cpu_usage, m.connections, d.name, d.id as db_id 
        FROM database_metrics m
        JOIN monitored_databases d ON m.db_id = d.id
        ORDER BY m.time DESC LIMIT 40";

    var data = await conn.QueryAsync(sql);
    return Results.Ok(data);
});
app.MapGet("/api/alerts", async () =>
{
    using var conn = new NpgsqlConnection(connString);
    var sql = @"
        SELECT a.message, a.severity, a.time, d.name as db_name
        FROM alerts a
        JOIN monitored_databases d ON a.db_id = d.id
        ORDER BY a.time DESC LIMIT 10";

    var data = await conn.QueryAsync(sql);
    return Results.Ok(data);
});
// NEW: Endpoint to register a new database
app.MapPost("/api/databases", async (DatabaseDto dto) =>
{
    using var conn = new NpgsqlConnection(connString);
    var sql = "INSERT INTO monitored_databases (name, connection_string) VALUES (@Name, @ConnStr)";

    await conn.ExecuteAsync(sql, new { Name = dto.Name, ConnStr = dto.ConnStr });
    return Results.Ok(new { message = "Database registered successfully!" });
});

// NEW: Endpoint to delete a database
app.MapDelete("/api/databases/{id}", async (int id) =>
{
    using var conn = new NpgsqlConnection(connString);

    // First, let's just mark it as inactive (Soft Delete) 
    // or you can use DELETE FROM for a hard delete.
    var sql = "DELETE FROM monitored_databases WHERE id = @Id";

    await conn.ExecuteAsync(sql, new { Id = id });
    return Results.Ok(new { message = "Database removed from monitoring." });
});

app.Run();

// Helper record for the incoming data
public record DatabaseDto(string Name, string ConnStr);