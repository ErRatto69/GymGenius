namespace GymGenius.Api.Domain.Entities;

public class ExerciseLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid WorkoutLogId { get; set; }
    public WorkoutLog WorkoutLog { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public int Order { get; set; }

    public List<SetLog> Sets { get; set; } = new();
}