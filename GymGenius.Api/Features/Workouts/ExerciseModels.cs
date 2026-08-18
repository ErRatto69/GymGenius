using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace GymGenius.Api.Features.Workouts;

public record CreateExerciseDto(
    [Required] string Name, 
    [Range(1, 100)] int Order, 
    string? Notes, 
    string? GifUrl,
    string? TargetMuscle,
    string? Equipment,
    List<Guid>? MuscleIds,
    List<CreateSetDto>? Sets
);

public record UpdateExerciseDto(
    [Required(ErrorMessage = "Il nome dell'esercizio è obbligatorio.")]
    string Name,
    [Range(1, 100)] int Order,
    string? Notes,
    string? GifUrl,
    string? TargetMuscle,
    string? Equipment,
    List<Guid>? MuscleIds
);

public record ExerciseDetailsResponse(
    Guid Id,
    string Name,
    int Order,
    string? Notes,
    string? GifUrl,
    string? TargetMuscle,
    string? Equipment,
    List<SetDetailsResponse> Sets
);

public record ExerciseDbItem(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("gifUrl")] string GifUrl,
    [property: JsonPropertyName("target")] string Target,
    [property: JsonPropertyName("bodyPart")] string BodyPart,
    [property: JsonPropertyName("equipment")] string Equipment,
    [property: JsonPropertyName("instructions")] List<string>? Instructions
);