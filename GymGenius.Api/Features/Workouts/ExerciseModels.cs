using System.ComponentModel.DataAnnotations;

namespace GymGenius.Api.Features.Workouts;

public record CreateExerciseDto(
    [Required] string Name, 
    [Range(1, 100)] int Order, 
    string? Notes, 
    List<CreateSetDto>? Sets
);

public record UpdateExerciseDto(
    [Required(ErrorMessage = "Il nome dell'esercizio è obbligatorio.")]
    string Name,
    [Range(1, 100)] int Order,
    string? Notes
);

public record ExerciseDetailsResponse(
    Guid Id,
    string Name,
    int Order,
    string? Notes,
    List<SetDetailsResponse> Sets
);