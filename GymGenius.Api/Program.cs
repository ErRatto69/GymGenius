using System.Text;
using System.Text.Json;
using GymGenius.Api.Domain.Entities;
using GymGenius.Api.Features.Auth;
using GymGenius.Api.Infrastructure.Persistence;
using GymGenius.Api.Infrastructure.Serialization;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurazione CORS
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// 2. Configurazione Database Context
builder.Services.AddDbContext<GymDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default"),
    o => o.UseNetTopologySuite()));

// 3. Configurazione Health Checks (Controllo Salute Applicazione)
builder.Services.AddHealthChecks()
    .AddDbContextCheck<GymDbContext>("PostgreSQL-Database");

// 4. Configurazione Identity Core
builder.Services.AddIdentityCore<User>(options => {
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<GymDbContext>()
.AddDefaultTokenProviders();

// 5. Configurazione Autenticazione JWT
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
builder.Services.AddOpenApi();

// 6. Configurazione Controller e Serializzazione JSON
builder.Services.AddControllers()
    .AddJsonOptions(options => {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new TrimStringConverter());
    });

builder.Services.AddScoped<ITokenService, TokenService>();

var app = builder.Build();

// ==========================================
// PIPELINE DEI MIDDLEWARE (GESTIONE RICHIESTE)
// ==========================================

// LIVELLO 1: Gestore Globale delle Eccezioni a Runtime
app.UseExceptionHandler(exceptionHandlerApp =>
{
    exceptionHandlerApp.Run(async context =>
    {
        context.Response.ContentType = "application/json";
        
        var exceptionFeature = context.Features.Get<IExceptionHandlerPathFeature>();
        var exception = exceptionFeature?.Error;

        // Se l'errore è causato dal Database disconnesso a runtime, restituiamo un 503 (Service Unavailable)
        if (exception != null && (exception.GetType().Name.Contains("Npgsql") || exception.GetType().Name.Contains("DbUpdate")))
        {
            context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
            await context.Response.WriteAsJsonAsync(new
            {
                StatusCode = 503,
                Message = "Il servizio database è temporaneamente non disponibile. Riprova più tardi."
            });
            return;
        }

        // Errore generico del server (500)
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsJsonAsync(new
        {
            StatusCode = 500,
            Message = "Si è verificato un errore interno imprevisto."
        });
    });
});

app.UseCors("AllowAll");

// Mappatura Endpoint Documentazione OpenAPI & Scalar
app.MapOpenApi();
app.MapScalarApiReference(options =>
{
    options.Title = "GymGenius";
    options.WithHttpBearerAuthentication(bearer =>
    {
        bearer.Token = "il-tuo-token-jwt";
    });
});

// Middleware di Autenticazione e Autorizzazione (Indispensabili per far funzionare [Authorize])
app.UseAuthentication();
app.UseAuthorization();

// Esposizione dell'endpoint di controllo salute (/health)
app.MapHealthChecks("/health");

// Mappatura dei Controller dell'API
app.MapControllers();

// LIVELLO 2: Gestione Protetta delle Migrazioni al Bootstrap dell'applicazione
using (var scope = app.Services.CreateScope()) 
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    
    try 
    {
        var context = services.GetRequiredService<GymDbContext>();
        logger.LogInformation("Tentativo di applicazione delle migrazioni del database...");
        context.Database.Migrate();
        logger.LogInformation("Database allineato e migrato con successo.");
    }
    catch (Exception ex)
    {
        // Cattura l'errore del database offline, lo logga chiaramente ma impedisce il crash dell'app!
        logger.LogCritical(ex, "ATTENZIONE: Impossibile connettersi al database PostgreSQL (Docker spento?). L'applicazione si avvierà in modalità degradata.");
    }
}

app.Run();