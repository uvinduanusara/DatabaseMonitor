using Dapper;
using Npgsql;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.AspNetCore.HttpOverrides; // Added for Proxy support
using System.Security.Claims;
using System.Text.Json;
using DotNetEnv;

// Load .env file
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// --- 1. SERVICES CONFIGURATION ---

// Forwarded Headers Configuration (FIXES REDIRECT LOOP)
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// Redis Caching
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = Environment.GetEnvironmentVariable("REDIS_CONNECTION") ?? "localhost:6379";
    options.InstanceName = "SaaS_Monitor_";
});

// Google OAuth2 & Cookie Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
})
.AddCookie(options =>
{
    options.Cookie.Name = "SaaS_Auth";
    options.Cookie.SameSite = SameSiteMode.None; // Required for Vercel -> VPS communication
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // Required for HTTPS
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
})
.AddGoogle(options =>
{
    options.ClientId = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID") ?? "YOUR_CLIENT_ID";
    options.ClientSecret = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_SECRET") ?? "YOUR_CLIENT_SECRET";
    options.SaveTokens = true;
});

builder.Services.AddAuthorization();
builder.Services.AddCors();

var app = builder.Build();

// --- 2. MIDDLEWARE ---

// --- 2. MIDDLEWARE ---

// 1. MUST BE FIRST: Fixes the HTTPS scheme from Caddy
app.UseForwardedHeaders();

// 2. MUST BE SECOND: Add CORS headers to EVERY request (even unauthenticated ones)
app.UseCors(policy => policy
    .WithOrigins(Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5173")
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials());

// 3. Now check if the user is logged in
app.UseAuthentication();
app.UseAuthorization();

// Database Connection String
string connString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING") ?? "";

// --- 3. AUTHENTICATION ENDPOINTS ---

app.MapGet("/api/auth/google-login", () =>
{
    var props = new AuthenticationProperties
    {
        RedirectUri = "/api/auth/callback",
        Items = { { "scheme", GoogleDefaults.AuthenticationScheme } }
    };
    return Results.Challenge(props, new[] { GoogleDefaults.AuthenticationScheme });
});

app.MapGet("/api/auth/me", (ClaimsPrincipal user) =>
{
    if (user.Identity?.IsAuthenticated != true)
        return Results.Unauthorized();

    return Results.Ok(new
    {
        Name = user.Identity.Name,
        Email = user.FindFirstValue(ClaimTypes.Email),
        Picture = user.FindFirstValue("picture")
    });
});

app.MapGet("/api/auth/logout", async (HttpContext context) =>
{
    await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
    return Results.Redirect(Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5173");
});

app.MapGet("/api/auth/callback", async (HttpContext context) =>
{
    var result = await context.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
    if (!result.Succeeded) return Results.Unauthorized();

    var email = result.Principal.FindFirstValue(ClaimTypes.Email);
    var googleId = result.Principal.FindFirstValue(ClaimTypes.NameIdentifier);

    using var conn = new NpgsqlConnection(connString);
    var sql = "INSERT INTO users (email, google_id) VALUES (@Email, @GId) ON CONFLICT (email) DO NOTHING";
    await conn.ExecuteAsync(sql, new { Email = email, GId = googleId });

    return Results.Redirect(Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5173");
});

// --- 4. DATA ENDPOINTS (PROTECTED) ---

app.MapGet("/api/metrics", async (IDistributedCache cache, ClaimsPrincipal user) =>
{
    var googleId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    using var conn = new NpgsqlConnection(connString);

    var sql = @"
        SELECT 
            m.db_id,
            d.name,
            time_bucket('1 minute', m.time) AS time, 
            avg(m.cpu) as cpu, 
            avg(m.memory) as memory
        FROM database_metrics m 
        JOIN monitored_databases d ON m.db_id = d.id 
        WHERE d.user_id = @UserId AND m.time > now() - interval '3 hours'
        GROUP BY m.db_id, d.name, time
        ORDER BY time ASC";

    var data = await conn.QueryAsync(sql, new { UserId = googleId });
    return Results.Ok(data);
}).RequireAuthorization();

app.MapGet("/api/databases", async (ClaimsPrincipal user) =>
{
    var googleId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    using var conn = new NpgsqlConnection(connString);

    var sql = @"SELECT id, name, db_type, connection_string FROM monitored_databases WHERE user_id = @UserId AND is_active = true";
    var data = await conn.QueryAsync<object>(sql, new { UserId = googleId });

    return Results.Ok(data);
}).RequireAuthorization();

app.MapPost("/api/databases", async (DatabaseDto dto, ClaimsPrincipal user) =>
{
    var googleId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    using var conn = new NpgsqlConnection(connString);

    var sql = @"INSERT INTO monitored_databases 
                (name, db_type, connection_string, user_id, is_active) 
                VALUES (@Name, @DbType, @Conn, @UserId, true)";

    await conn.ExecuteAsync(sql, new
    {
        dto.Name,
        dto.DbType,
        Conn = dto.ConnStr,
        UserId = googleId
    });

    return Results.Ok(new { message = "Registered!" });
}).RequireAuthorization();

app.MapDelete("/api/databases/{id}", async (int id, ClaimsPrincipal user) =>
{
    var googleId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    using var conn = new NpgsqlConnection(connString);
    var sql = "DELETE FROM monitored_databases WHERE id = @Id AND user_id = @UserId";

    await conn.ExecuteAsync(sql, new { Id = id, UserId = googleId });
    return Results.Ok(new { message = "Deleted" });
}).RequireAuthorization();

app.Run();

public record DatabaseDto(string Name, string DbType, string ConnStr);