using Monitor.Domain.Entities;

namespace Monitor.Application.Interfaces;

public interface IMonitoringService
{
    Task CheckAndSaveMetricsAsync(MonitoredDatabase database);
}
