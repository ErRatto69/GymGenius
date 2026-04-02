using System.Text;
using System.Text.Json;
using GymGenius.Api.Domain.Entities;
using GymGenius.Api.Features.Auth;
using GymGenius.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// 1. CORS Policy - Permette al mobile di parlare col backend
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// 2. Database & Identity
builder.Services.AddDbContext<GymDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default"),
    o => o.UseNetTopologySuite()));

builder.Services.AddIdentityCore<User>(options => {
    options.Password.RequireDigit = false; // Facilitiamo i test
    options.Password.RequiredLength = 6;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<GymDbContext>()
.AddDefaultTokenProviders();

// 3. Auth & JWT
var jwtKey = builder.Configuration["Jwt:Key"] ?? "ChiaveDiBackupLungaAlmeno32Caratteri!";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 4. Controller con configurazione CamelCase
builder.Services.AddControllers()
    .AddJsonOptions(options => {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

builder.Services.AddScoped<ITokenService, TokenService>();

var app = builder.Build();

// Ordine Middleware Fondamentale!
app.UseCors("AllowAll"); // Prima di Auth!

if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope()) {
    scope.ServiceProvider.GetRequiredService<GymDbContext>().Database.Migrate();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();