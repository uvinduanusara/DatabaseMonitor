# Use the 9.0 SDK to match your project target
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Note the path: Monitor.Worker/Monitor.Worker.csproj
COPY ["Monitor.Worker/Monitor.Worker.csproj", "Monitor.Worker/"]
RUN dotnet restore "Monitor.Worker/Monitor.Worker.csproj"

# Copy everything and publish
COPY . .
WORKDIR "/src/Monitor.Worker"
RUN dotnet publish "Monitor.Worker.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Use the Runtime image
FROM mcr.microsoft.com/dotnet/runtime:9.0 AS final
WORKDIR /app

# --- ADDED: Install Kerberos library for Npgsql ---
USER root
RUN apt-get update && \
    apt-get install -y libgssapi-krb5-2 && \
    rm -rf /var/lib/apt/lists/*
# --------------------------------------------------

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Monitor.Worker.dll"]