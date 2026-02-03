using Monitor.Domain.Entities;

namespace Monitor.Domain.Interfaces;

public interface IUserRepository
{
    Task UpsertUserAsync(User user);
    Task<User?> GetUserByEmailAsync(string email);
}

public interface IDatabaseRepository
{
    Task<IEnumerable<MonitoredDatabase>> GetDatabasesByUserAsync(string userId);
    Task<IEnumerable<MonitoredDatabase>> GetAllActiveDatabasesAsync();
    Task AddDatabaseAsync(MonitoredDatabase database);
    Task DeleteDatabaseAsync(int id, string userId);
}

public interface IMetricRepository
{
    Task AddMetricAsync(DatabaseMetric metric);
    Task<IEnumerable<dynamic>> GetMetricsByUserAsync(string userId, TimeSpan since);
}
