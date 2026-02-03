# Use the .NET 10.0 Preview SDK
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# 1. Copy ALL .csproj files first (This optimizes Docker layer caching)
COPY ["src/Monitor.Domain/Monitor.Domain.csproj", "src/Monitor.Domain/"]
COPY ["src/Monitor.Application/Monitor.Application.csproj", "src/Monitor.Application/"]
COPY ["src/Monitor.Infrastructure/Monitor.Infrastructure.csproj", "src/Monitor.Infrastructure/"]
COPY ["src/Monitor.API/Monitor.API.csproj", "src/Monitor.API/"]

# 2. Restore the API (This automatically restores dependent projects)
RUN dotnet restore "src/Monitor.API/Monitor.API.csproj"

# 3. Copy the entire source code
COPY . .

# 4. Build the API project
WORKDIR "/src/src/Monitor.API"
RUN dotnet build "Monitor.API.csproj" -c Release -o /app/build

# 5. Publish the application
FROM build AS publish
WORKDIR "/src/src/Monitor.API"
RUN dotnet publish "Monitor.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 6. Final Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Ensure the DLL name matches exactly what is generated in src/Monitor.API
ENTRYPOINT ["dotnet", "Monitor.API.dll"]