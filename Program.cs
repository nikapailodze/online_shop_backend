using System;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OnlineShopBackend.Data;
using OnlineShopBackend.Models;
using OnlineShopBackend.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Respect platform-provided port/urls (Render uses PORT), fallback to 8080.
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
var urls = Environment.GetEnvironmentVariable("ASPNETCORE_URLS") ?? $"http://0.0.0.0:{port}";
builder.WebHost.UseUrls(urls);

// Allow flat env vars (e.g., JWT_SECRETKEY) to override Jwt settings for hosts
// that don't support double-underscore nesting.
void ApplyFlatJwtEnvOverrides(IConfiguration config)
{
    static void SetIfPresent(IConfiguration config, string key, string? value)
    {
        if (!string.IsNullOrWhiteSpace(value))
        {
            config[key] = value;
        }
    }

    SetIfPresent(config, "Jwt:SecretKey", Environment.GetEnvironmentVariable("JWT_SECRET_KEY"));
    SetIfPresent(config, "Jwt:Issuer", Environment.GetEnvironmentVariable("JWT_ISSUER"));
    SetIfPresent(config, "Jwt:Audience", Environment.GetEnvironmentVariable("JWT_AUDIENCE"));
    SetIfPresent(config, "Jwt:ExpiresInMinutes", Environment.GetEnvironmentVariable("JWT_EXPIRES_IN_MINUTES"));
}

ApplyFlatJwtEnvOverrides(builder.Configuration);

// Allow a flat DB connection string env var override (for SQL Server hosting).
var dbConnection =
    builder.Configuration.GetConnectionString("Default") ??
    builder.Configuration["DbConnectionString"] ??
    Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
var dbProvider = (builder.Configuration["DB_PROVIDER"] ?? string.Empty).ToLowerInvariant();

var jwtSection = builder.Configuration.GetSection("Jwt");
builder.Services.Configure<JwtSettings>(jwtSection);
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));

var secretKey = jwtSection["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey is not configured.");
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

builder.Services.AddScoped<ITokenService, JwtTokenService>();
builder.Services.AddScoped<IEmailService, SmtpEmailService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSection["Issuer"],
        ValidAudience = jwtSection["Audience"],
        IssuerSigningKey = signingKey
    };
});
builder.Services.AddAuthorization();
builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (!string.IsNullOrWhiteSpace(dbConnection))
    {
        var useMySql =
            dbProvider == "mysql" ||
            (dbProvider == string.Empty &&
             (dbConnection.Contains("Port=3306", StringComparison.OrdinalIgnoreCase) ||
              dbConnection.Contains("Uid=", StringComparison.OrdinalIgnoreCase) ||
              dbConnection.Contains("User Id=", StringComparison.OrdinalIgnoreCase)));

        if (useMySql)
            options.UseMySql(dbConnection, ServerVersion.AutoDetect(dbConnection));
        else
            options.UseSqlServer(dbConnection);
    }
    else
    {
        options.UseSqlite("Data Source=shop.db");
    }
});
builder.Services.AddCors(options =>
{
    var origins = (builder.Configuration["CORS_ORIGINS"] ?? string.Empty)
        .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    options.AddPolicy("AllowReact", policy =>
    {
        if (origins.Length > 0)
        {
            policy.WithOrigins(origins)
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
        else
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.UseCors("AllowReact");
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // Enable Swagger in non-development when explicitly allowed via env var.
    var enableSwagger = builder.Configuration["ENABLE_SWAGGER"];
    if (string.Equals(enableSwagger, "true", StringComparison.OrdinalIgnoreCase))
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }
}

app.MapControllers();
app.Run();
