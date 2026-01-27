# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY RealEstatePlatform.sln .
COPY RealEstate.API/RealEstate.API.csproj RealEstate.API/
COPY RealEstate.Service/RealEstate.Service.csproj RealEstate.Service/
COPY RealEstate.Repository/RealEstate.Repository.csproj RealEstate.Repository/
COPY RealEstate.Domain/RealEstate.Domain.csproj RealEstate.Domain/

# Restore dependencies
RUN dotnet restore RealEstate.API/RealEstate.API.csproj

# Copy everything else
COPY . .

# Build and publish
WORKDIR /src/RealEstate.API
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Copy published app
COPY --from=build /app/publish .

# Expose port
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "RealEstate.API.dll"]