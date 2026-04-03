namespace GymGenius.Api.Domain.Entities;

public class Set
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid ExerciseId { get; set; }
    public Exercise Exercise { get; set; } = null!;

    public int Number { get; set; } 
    
    public string TargetReps { get; set; } = string.Empty; 
    public int TargetRestSeconds { get; set; } 
    public string? TargetWeight { get; set; } 
    public string? Notes { get; set; }
}