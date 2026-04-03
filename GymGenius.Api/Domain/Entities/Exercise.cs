namespace GymGenius.Api.Domain.Entities;

public class Exercise
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid WorkoutId { get; set; }
    public Workout Workout { get; set; } = null!;

    public string Name { get; set; } = string.Empty; 
    public int Order { get; set; } 
    public string? Notes { get; set; }

    public List<Set> Sets { get; set; } = new();
}