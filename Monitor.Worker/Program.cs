using Microsoft.Extensions.Configuration;
using Monitor.Worker;

var builder = Host.CreateApplicationBuilder(args);

builder.Configuration.AddEnvironmentVariables();

// Load environment variables from .env file if it exists
LoadEnvFile(builder.Configuration);

builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();

static void LoadEnvFile(IConfigurationBuilder configuration)
{
    var envFile = Path.Combine(Directory.GetCurrentDirectory(), ".env");
    if (File.Exists(envFile))
    {
        foreach (var line in File.ReadAllLines(envFile))
        {
            var trimmedLine = line.Trim();
            if (string.IsNullOrEmpty(trimmedLine) || trimmedLine.StartsWith("#"))
                continue;

            var equalSign = trimmedLine.IndexOf('=');
            if (equalSign > 0)
            {
                var key = trimmedLine.Substring(0, equalSign).Trim();
                var value = trimmedLine.Substring(equalSign + 1).Trim();
                Environment.SetEnvironmentVariable(key, value);
            }
        }
    }
}
