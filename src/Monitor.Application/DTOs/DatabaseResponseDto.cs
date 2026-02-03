using System.Text.Json.Serialization;

namespace Monitor.Application.DTOs;

public class DatabaseResponseDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("connection_string")]
    public string ConnectionString { get; set; } = string.Empty;

    [JsonPropertyName("db_type")]
    public string DbType { get; set; } = string.Empty;

    [JsonPropertyName("is_active")]
    public bool IsActive { get; set; }
}
