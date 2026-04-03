using System.ComponentModel.DataAnnotations;

namespace GymGenius.Api.Domain.Entities;

public class WorkoutLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public string UserId { get; set; } = null!;
    public User User { get; set; } = null!;
    
    public Guid? WorkoutId { get; set; }
    public Workout? Workout { get; set; }

    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; } 
    
    public string? Notes { get; set; } 

    public List<ExerciseLog> Exercises { get; set; } = new();
}