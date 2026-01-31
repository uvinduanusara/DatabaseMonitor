# Use the .NET 9.0 SDK (It supports .NET 10 projects better than 8.0)
# Or use 10.0-preview if you specifically need .NET 10 features
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["Monitor.Api/Monitor.Api.csproj", "Monitor.Api/"]
RUN dotnet restore "Monitor.Api/Monitor.Api.csproj"

COPY . .
WORKDIR "/src/Monitor.Api"
RUN dotnet build "Monitor.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Monitor.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Use the .NET 9.0 Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Monitor.Api.dll"]