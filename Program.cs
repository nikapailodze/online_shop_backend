using Microsoft.EntityFrameworkCore;
using OnlineShopBackend.Data;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://localhost:5001");

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ✅ Connect SQLite database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=shop.db"));

// ✅ Allow React frontend to call your backend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy.WithOrigins("http://localhost:3000")
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});

var app = builder.Build();

// ✅ Use CORS
app.UseCors("AllowReact");

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();
app.Run();
