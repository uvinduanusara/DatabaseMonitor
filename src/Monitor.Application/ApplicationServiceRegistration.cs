using Microsoft.Extensions.DependencyInjection;

namespace Monitor.Application;

public static class ApplicationServiceRegistration
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Add Application services here, e.g. MediatR, AutoMapper, or Domain Services
        return services;
    }
}
