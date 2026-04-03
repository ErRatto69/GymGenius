namespace GymGenius.Api.Domain.Entities;

public class Workout
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid SplitId { get; set; }
    public Split Split { get; set; } = null!;

    public string Name { get; set; } = string.Empty; 

    public int DayOrder { get; set; } 
    
    public string? Notes { get; set; }

    public List<Exercise> Exercises { get; set; } = new();
}