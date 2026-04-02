using Microsoft.AspNetCore.Identity;
using NetTopologySuite.Geometries;

namespace GymGenius.Api.Domain.Entities;

public class User : IdentityUser
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    
    // Dati fisici
    public double? Weight { get; set; }
    public double? Height { get; set; }
    
    // Posizione per "Trova amici in zona" (Longitudine, Latitudine)
    public Point? Location { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}