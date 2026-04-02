using System.Text;
using GymGenius.Api.Domain.Entities;
using GymGenius.Api.Features.Auth;
using GymGenius.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// 1. Database & Persistence
builder.Services.AddDbContext<GymDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default"),
    o => o.UseNetTopologySuite()));

// 2. Identity Core
builder.Services.AddIdentityCore<User>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = false;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<GymDbContext>()
.AddDefaultTokenProviders();

// 3. Autenticazione JWT
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key non configurata.");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
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

// 4. Swagger con supporto JWT
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 5. Servizi Custom
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddControllers();

var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => 
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "GymGenius API v1");
        c.RoutePrefix = string.Empty; // Swagger apparirà direttamente alla root (es. http://localhost:5000/)
    });
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Automigrazione allo startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<GymDbContext>();
    db.Database.Migrate();
}

app.Run();