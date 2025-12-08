FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /src
COPY OnlineShopBackend.csproj ./
RUN dotnet restore OnlineShopBackend.csproj
COPY . .
RUN dotnet publish OnlineShopBackend.csproj -c Release -o /app/out

FROM base AS final
WORKDIR /app
COPY --from=build /app/out .
# Default to port 8080; override with ASPNETCORE_URLS if needed
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
ENTRYPOINT ["dotnet", "OnlineShopBackend.dll"]
