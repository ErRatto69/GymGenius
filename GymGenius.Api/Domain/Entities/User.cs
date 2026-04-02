using Microsoft.AspNetCore.Identity;
using NetTopologySuite.Geometries;

namespace GymGenius.Api.Domain.Entities;

public class User : IdentityUser
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    
    public double? Weight { get; set; }
    public double? Height { get; set; }
    
    // Preferenze Alimentari e Fisiologiche (Array di stringhe)
    public List<string?> PreferredFoods { get; set; } = new();
    public List<string?> DislikedFoods { get; set; } = new();
    public List<string?> Allergies { get; set; } = new();
    public List<string?> Injuries { get; set; } = new();
    
    // Obiettivi e Setup
    public string? FitnessGoal { get; set; }
    public string? AvailableEquipment { get; set; }
    
    public Point? Location { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}