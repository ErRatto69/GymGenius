using System.ComponentModel.DataAnnotations;

namespace GymGenius.Api.Features.Workouts;

public record CreateWorkoutDto(
    [Required(ErrorMessage = "WorkoutModelNameRequired")]
    [MinLength(2, ErrorMessage = "WorkoutModelNameMinLength2")]
    string Name, 
    
    [Range(1, 30, ErrorMessage = "WorkoutModelDayValid")]
    int DayOrder, 
    
    [MaxLength(200)]
    string? Notes, 
    
    List<CreateExerciseDto>? Exercises
);

public record UpdateWorkoutDto(
    [Required(ErrorMessage = "WorkoutModelNameRequired")]
    [MinLength(2, ErrorMessage = "WorkoutModelNameMinLength2")]
    string Name, 
    
    [Range(1, 30, ErrorMessage = "WorkoutModelDayValid")]
    int DayOrder, 
    
    [MaxLength(200)]
    string? Notes
);

public record WorkoutDetailsResponse(
    Guid Id,
    string Name,
    int DayOrder,
    string? Notes,
    List<ExerciseDetailsResponse> Exercises
);