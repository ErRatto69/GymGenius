namespace GymGenius.Api.Domain.Entities;

public class Muscle
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    
    public List<Exercise> Exercises { get; set; } = new();
}