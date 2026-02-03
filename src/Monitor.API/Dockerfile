# Use the .NET 10.0 Preview SDK
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy ONLY the csproj files
COPY ["src/Monitor.Domain/Monitor.Domain.csproj", "src/Monitor.Domain/"]
COPY ["src/Monitor.Application/Monitor.Application.csproj", "src/Monitor.Application/"]
COPY ["src/Monitor.Infrastructure/Monitor.Infrastructure.csproj", "src/Monitor.Infrastructure/"]
COPY ["src/Monitor.Api/Monitor.Api.csproj", "src/Monitor.Api/"]

# Restore
RUN dotnet restore "src/Monitor.Api/Monitor.Api.csproj"

# Copy everything else
COPY . .

# Build
WORKDIR "/src/src/Monitor.Api"
RUN dotnet build "Monitor.Api.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "Monitor.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Monitor.Api.dll"]