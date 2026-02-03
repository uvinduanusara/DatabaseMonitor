namespace Monitor.Domain.Entities;

public class MonitoredDatabase
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string ConnectionString { get; set; } = string.Empty;
    public string DbType { get; set; } = string.Empty;
    public string Host { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public string? TenantId { get; set; }
}
