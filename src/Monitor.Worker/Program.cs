using DotNetEnv;
using Monitor.Application;
using Monitor.Infrastructure;
using Monitor.Worker;

// Load .env
Env.Load();

var builder = Host.CreateApplicationBuilder(args);

// Add Services
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices();

builder.Services.AddHostedService<Worker>();

var host = builder.Build();

using (var scope = host.Services.CreateScope())
{
    var initializer = scope.ServiceProvider.GetRequiredService<Monitor.Infrastructure.Persistence.DbInitializer>();
    await initializer.InitializeAsync();
}

host.Run();
