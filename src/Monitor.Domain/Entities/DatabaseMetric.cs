namespace Monitor.Domain.Entities;

public class DatabaseMetric
{
    public int DbId { get; set; }
    public DateTime Time { get; set; }
    public double? Cpu { get; set; }
    public double? Memory { get; set; }
    public double? StorageUsage { get; set; }
    public string? TenantId { get; set; }
}
