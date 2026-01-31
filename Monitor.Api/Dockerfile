# Use the official .NET SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the project file and restore dependencies
COPY ["Monitor.Api/Monitor.Api.csproj", "Monitor.Api/"]
RUN dotnet restore "Monitor.Api/Monitor.Api.csproj"

# Copy the rest of the code and build it
COPY . .
WORKDIR "/src/Monitor.Api"
RUN dotnet build "Monitor.Api.csproj" -c Release -o /app/build

# Publish the app
FROM build AS publish
RUN dotnet publish "Monitor.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Use the lightweight ASP.NET runtime image for the final container
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Monitor.Api.dll"]