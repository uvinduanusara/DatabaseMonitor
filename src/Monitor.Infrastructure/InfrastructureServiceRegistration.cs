using Microsoft.Extensions.DependencyInjection;
using Monitor.Domain.Interfaces;
using Monitor.Infrastructure.Persistence;

namespace Monitor.Infrastructure;

public static class InfrastructureServiceRegistration
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services)
    {
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IDatabaseRepository, DatabaseRepository>();
        services.AddScoped<IMetricRepository, MetricRepository>();
        services.AddScoped<Monitor.Application.Interfaces.IMonitoringService, Services.MonitoringService>();
        services.AddSingleton<DbInitializer>();
        return services;
    }
}
