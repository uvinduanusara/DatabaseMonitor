# Use the .NET 10.0 Preview SDK
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# 1. Copy ONLY the .csproj files first (Case-sensitive fix)
COPY ["src/Monitor.Domain/Monitor.Domain.csproj", "src/Monitor.Domain/"]
COPY ["src/Monitor.Application/Monitor.Application.csproj", "src/Monitor.Application/"]
COPY ["src/Monitor.Infrastructure/Monitor.Infrastructure.csproj", "src/Monitor.Infrastructure/"]
COPY ["src/Monitor.Api/Monitor.Api.csproj", "src/Monitor.Api/"]

# 2. Restore the API 
RUN dotnet restore "src/Monitor.Api/Monitor.Api.csproj"

# 3. Copy everything else
COPY . .

# 4. Build the project (Using exact casing from your src/ folder)
WORKDIR "/src/src/Monitor.Api"
RUN dotnet build "Monitor.Api.csproj" -c Release -o /app/build

# 5. Publish
FROM build AS publish
WORKDIR "/src/src/Monitor.Api"
RUN dotnet publish "Monitor.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 6. Final Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Monitor.Api.dll"]