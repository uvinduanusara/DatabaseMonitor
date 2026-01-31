# Use the .NET 10.0 Preview SDK
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy and restore using the Preview SDK
COPY ["Monitor.Api/Monitor.Api.csproj", "Monitor.Api/"]
RUN dotnet restore "Monitor.Api/Monitor.Api.csproj"

# Copy the rest of the source code
COPY . .
WORKDIR "/src/Monitor.Api"
RUN dotnet build "Monitor.Api.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "Monitor.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Use the .NET 10.0 Preview Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Monitor.Api.dll"]