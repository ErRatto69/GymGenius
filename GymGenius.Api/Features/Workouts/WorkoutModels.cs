using System.ComponentModel.DataAnnotations;

namespace GymGenius.Api.Features.Workouts;

public record CreateWorkoutDto(
    [Required(ErrorMessage = "WorkoutModelsNameRequired")]
    [MinLength(2, ErrorMessage = "WorkoutModelsNameMinLength")]
    string Name, 
    
    [Range(1, 30, ErrorMessage = "WorkoutModelsDayValid")]
    int DayOrder, 
    
    [MaxLength(200)]
    string? Notes, 
    
    List<CreateExerciseDto>? Exercises
);

public record UpdateWorkoutDto(
    [Required(ErrorMessage = "WorkoutModelsNameRequired")]
    [MinLength(2, ErrorMessage = "WorkoutModelsNameMinLength")]
    string Name, 
    
    [Range(1, 30, ErrorMessage = "WorkoutModelsDayValid")]
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