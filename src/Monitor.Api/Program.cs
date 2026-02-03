using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.HttpOverrides;
using System.Security.Claims;
using DotNetEnv;
using Monitor.Application;
using Monitor.Infrastructure;
using Monitor.Application.DTOs;
using Monitor.Domain.Entities;
using Monitor.Domain.Interfaces;
using Monitor.Infrastructure.Persistence;

// Load .env file
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// --- 1. SERVICES CONFIGURATION ---
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = Environment.GetEnvironmentVariable("REDIS_CONNECTION") ?? "localhost:6379";
    options.InstanceName = "SaaS_Monitor_";
});

// Add Layer Services
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices();

builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
})
.AddCookie(options =>
{
    options.Cookie.Name = "SaaS_Auth";
    options.Cookie.Path = "/";
    options.Cookie.SameSite = SameSiteMode.None; 
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always; 
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

// --- 2. DATABASE AUTO-MIGRATION ---
using (var scope = app.Services.CreateScope())
{
    var initializer = scope.ServiceProvider.GetRequiredService<DbInitializer>();
    await initializer.InitializeAsync();
}

// --- 3. MIDDLEWARE ---

app.UseForwardedHeaders();

app.UseCors(policy => policy
    .WithOrigins(Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5173")
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials());

app.UseAuthentication();
app.UseAuthorization();

// --- 4. AUTHENTICATION ENDPOINTS ---

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

app.MapGet("/api/auth/callback", async (HttpContext context, IUserRepository userRepo) =>
{
    var result = await context.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
    if (!result.Succeeded) return Results.Unauthorized();

    var email = result.Principal.FindFirstValue(ClaimTypes.Email) ?? "";
    var googleId = result.Principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
    var name = result.Principal.Identity?.Name;
    var picture = result.Principal.FindFirstValue("picture");

    var user = new User 
    { 
        Email = email, 
        GoogleId = googleId, 
        Name = name, 
        Picture = picture,
        TenantId = null // Default/Null for now
    };

    await userRepo.UpsertUserAsync(user);

    return Results.Redirect(Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5173");
});

// --- 5. DATA ENDPOINTS (PROTECTED) ---

app.MapGet("/api/metrics", async (ClaimsPrincipal user, IMetricRepository metricRepo) =>
{
    var googleId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(googleId)) return Results.Unauthorized();

    // The original logic filtered by "now() - interval '3 hours'".
    // My repository: GetMetricsByUserAsync(userId, TimeSpan.FromHours(3))
    var metrics = await metricRepo.GetMetricsByUserAsync(googleId, TimeSpan.FromHours(3));
    return Results.Ok(metrics);
}).RequireAuthorization();

app.MapGet("/api/databases", async (ClaimsPrincipal user, IDatabaseRepository dbRepo) =>
{
    var googleId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(googleId)) return Results.Unauthorized();

    var dbs = await dbRepo.GetDatabasesByUserAsync(googleId);
    var dtos = dbs.Select(d => new DatabaseResponseDto
    {
        Id = d.Id,
        Name = d.Name,
        ConnectionString = d.ConnectionString,
        DbType = d.DbType,
        IsActive = d.IsActive
    });
    return Results.Ok(dtos);
}).RequireAuthorization();

app.MapPost("/api/databases", async (DatabaseDto dto, ClaimsPrincipal user, IDatabaseRepository dbRepo) =>
{
    var googleId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(googleId)) return Results.Unauthorized();

    var db = new MonitoredDatabase
    {
        Name = dto.Name,
        DbType = dto.DbType,
        ConnectionString = dto.ConnStr,
        UserId = googleId,
        IsActive = true
    };

    await dbRepo.AddDatabaseAsync(db);
    return Results.Ok(new { message = "Registered!" });
}).RequireAuthorization();

app.MapDelete("/api/databases/{id}", async (int id, ClaimsPrincipal user, IDatabaseRepository dbRepo) =>
{
    var googleId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(googleId)) return Results.Unauthorized();

    await dbRepo.DeleteDatabaseAsync(id, googleId);
    return Results.Ok(new { message = "Deleted" });
}).RequireAuthorization();

app.Run();