FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy all layers
COPY ["src/Monitor.Domain/Monitor.Domain.csproj", "src/Monitor.Domain/"]
COPY ["src/Monitor.Application/Monitor.Application.csproj", "src/Monitor.Application/"]
COPY ["src/Monitor.Infrastructure/Monitor.Infrastructure.csproj", "src/Monitor.Infrastructure/"]
COPY ["src/Monitor.Worker/Monitor.Worker.csproj", "src/Monitor.Worker/"]

RUN dotnet restore "src/Monitor.Worker/Monitor.Worker.csproj"
COPY . .

WORKDIR "/src/src/Monitor.Worker"
RUN dotnet publish "Monitor.Worker.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/runtime:10.0-preview AS final
WORKDIR /app
USER root
RUN apt-get update && apt-get install -y libgssapi-krb5-2 && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Monitor.Worker.dll"]