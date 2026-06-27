using System.ComponentModel.DataAnnotations;

namespace GymGenius.Api.Features.Workouts;

public record CreateExerciseDto(
    [Required] string Name, 
    [Range(1, 100)] int Order, 
    string? Notes, 
    List<Guid>? MuscleIds,
    List<CreateSetDto>? Sets
);

public record UpdateExerciseDto(
    [Required(ErrorMessage = "Il nome dell'esercizio è obbligatorio.")]
    string Name,
    [Range(1, 100)] int Order,
    string? Notes,
    List<Guid>? MuscleIds
);

public record ExerciseDetailsResponse(
    Guid Id,
    string Name,
    int Order,
    string? Notes,
    List<SetDetailsResponse> Sets
);

public record WgerApiResponse(List<WgerExerciseItem> Results);
public record WgerExerciseItem(int Id, string Name, string Description);

public record ImportExerciseLibraryRequest(
    [Required(ErrorMessage = "Il nome dell'esercizio è obbligatorio.")]
    string Name,
    
    [Range(1, 100, ErrorMessage = "L'ordine dell'esercizio deve essere valido.")]
    int Order,
    
    string? Notes,
    List<Guid>? MuscleIds
);