namespace GymGenius.Api.Domain.Entities;

public class SetLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid ExerciseLogId { get; set; }
    public ExerciseLog ExerciseLog { get; set; } = null!;

    public int Number { get; set; }
    
    public int Reps { get; set; } 
    public double Weight { get; set; } 
    
    public string? Notes { get; set; } 
}