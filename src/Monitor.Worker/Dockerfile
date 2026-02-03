# Use the .NET 10.0 Preview SDK (Matching your API)
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# 1. Copy ALL .csproj files first for the build context
COPY ["src/Monitor.Domain/Monitor.Domain.csproj", "src/Monitor.Domain/"]
COPY ["src/Monitor.Application/Monitor.Application.csproj", "src/Monitor.Application/"]
COPY ["src/Monitor.Infrastructure/Monitor.Infrastructure.csproj", "src/Monitor.Infrastructure/"]
COPY ["src/Monitor.Worker/Monitor.Worker.csproj", "src/Monitor.Worker/"]

# 2. Restore the Worker (This resolves dependencies across layers)
RUN dotnet restore "src/Monitor.Worker/Monitor.Worker.csproj"

# 3. Copy the entire source code
COPY . .

# 4. Publish the Worker
WORKDIR "/src/src/Monitor.Worker"
RUN dotnet publish "Monitor.Worker.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 5. Final Runtime Stage
FROM mcr.microsoft.com/dotnet/runtime:10.0-preview AS final
WORKDIR /app

# --- Keep your critical Kerberos library for PostgreSQL/Npgsql ---
USER root
RUN apt-get update && \
    apt-get install -y libgssapi-krb5-2 && \
    rm -rf /var/lib/apt/lists/*
# --------------------------------------------------------------

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Monitor.Worker.dll"]