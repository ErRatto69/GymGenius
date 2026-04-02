using Microsoft.AspNetCore.Identity;
using NetTopologySuite.Geometries;

namespace GymGenius.Api.Domain.Entities;

public class User : IdentityUser
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    
    // Dati fisici (opzionali in fase di registrazione)
    public double? Weight { get; set; }
    public double? Height { get; set; }
    
    // Predisposizione futura Social (PostGIS)
    public Point? Location { get; set; }
    
    // Gestione Sessione Stateless
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}