using System;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OnlineShopBackend.Data;
using OnlineShopBackend.Models;
using OnlineShopBackend.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://localhost:5001");

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
    options.UseSqlite("Data Source=shop.db"));
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy.WithOrigins("http://localhost:3000")
                        .AllowAnyHeader()
                        .AllowAnyMethod());
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

app.MapControllers();
app.Run();
