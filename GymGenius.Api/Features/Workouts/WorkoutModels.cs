namespace GymGenius.Api.Features.Workouts;

public record CreateSplitRequest(
    string Title, 
    string? Description, 
    string Goal, 
    int CycleLengthDays, 
    List<CreateWorkoutDto> Workouts
);

public record CreateWorkoutDto(
    string Name, 
    int Order, 
    string? Notes, 
    List<CreateExerciseDto> Exercises
);

public record CreateExerciseDto(
    string Name, 
    int Order, 
    string? Notes, 
    List<CreateSetDto> Sets
);

public record CreateSetDto(
    int Number, 
    string TargetReps, 
    int TargetRestSeconds, 
    string? TargetWeight, 
    string? Notes
);

public record SplitSummaryResponse(
    Guid Id, 
    string Title, 
    string Goal, 
    int CycleLengthDays, 
    bool IsAiGenerated, 
    DateTime CreatedAt
);