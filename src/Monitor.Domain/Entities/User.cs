namespace Monitor.Domain.Entities;

public class User
{
    public string GoogleId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Picture { get; set; }
    public string? TenantId { get; set; }
}
