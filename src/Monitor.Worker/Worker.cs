using Monitor.Application.Interfaces;
using Monitor.Domain.Interfaces;

namespace Monitor.Worker;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly IServiceScopeFactory _scopeFactory;

    public Worker(ILogger<Worker> logger, IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var dbRepo = scope.ServiceProvider.GetRequiredService<IDatabaseRepository>();
                var monitorService = scope.ServiceProvider.GetRequiredService<IMonitoringService>();

                var targets = await dbRepo.GetAllActiveDatabasesAsync();

                foreach (var target in targets)
                {
                    await monitorService.CheckAndSaveMetricsAsync(target);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("Master Loop Error: {message}", ex.Message);
            }

            await Task.Delay(10000, stoppingToken);
        }
    }
}