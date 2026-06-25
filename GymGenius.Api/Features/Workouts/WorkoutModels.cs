using System.ComponentModel.DataAnnotations;

namespace GymGenius.Api.Features.Workouts;

public record CreateWorkoutDto(
    [Required(ErrorMessage = "Il nome dell'allenamento è obbligatorio.")]
    [MinLength(2, ErrorMessage = "Il nome deve avere almeno 2 caratteri.")]
    string Name, 
    
    [Range(1, 30, ErrorMessage = "Il giorno deve essere valido.")]
    int DayOrder, 
    
    [MaxLength(200)]
    string? Notes, 
    
    List<CreateExerciseDto>? Exercises
);

public record UpdateWorkoutDto(
    [Required(ErrorMessage = "Il nome dell'allenamento è obbligatorio.")]
    [MinLength(2, ErrorMessage = "Il nome deve avere almeno 2 caratteri.")]
    string Name, 
    
    [Range(1, 30, ErrorMessage = "Il giorno deve essere valido.")]
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