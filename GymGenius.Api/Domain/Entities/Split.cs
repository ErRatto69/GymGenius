using System.ComponentModel.DataAnnotations;

namespace GymGenius.Api.Domain.Entities;

public class Split
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public string UserId { get; set; } = null!;
    public User User { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Goal { get; set; } = string.Empty;
    public bool IsAiGenerated { get; set; } = false;
    
    public int CycleLengthDays { get; set; } = 7; 

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    public List<Workout> Workouts { get; set; } = new();
}