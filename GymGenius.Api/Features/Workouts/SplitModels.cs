using System.ComponentModel.DataAnnotations;

namespace GymGenius.Api.Features.Workouts;

public record CreateSplitRequest(
    [Required(ErrorMessage = "Il titolo è obbligatorio.")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Il titolo deve essere tra 3 e 50 caratteri.")]
    string Title, 
    
    [MaxLength(500, ErrorMessage = "La descrizione è troppo lunga.")]
    string? Description, 
    
    [Required(ErrorMessage = "L'obiettivo è obbligatorio.")]
    string Goal, 
    
    [Range(1, 30, ErrorMessage = "Il ciclo deve essere tra 1 e 30 giorni.")]
    int CycleLengthDays, 
    
    List<CreateWorkoutDto>? Workouts
);

public record SplitSummaryResponse(
    Guid Id, 
    string Title, 
    string Goal, 
    int CycleLengthDays, 
    bool IsAiGenerated, 
    DateTime CreatedAt
);

public record SplitDetailsResponse(
    Guid Id,
    string Title,
    string? Description,
    string Goal,
    int CycleLengthDays,
    bool IsAiGenerated,
    DateTime CreatedAt,
    List<WorkoutDetailsResponse> Workouts
);