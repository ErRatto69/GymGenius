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

public record CreateExerciseDto(
    [Required] string Name,
    [Range(1, 100)] int Order, 
    string? Notes, 
    List<CreateSetDto>? Sets
);

public record CreateSetDto(
    [Range(1, 50)] int Number,
    [Required] string TargetReps, 
    [Range(0, 600)] int TargetRestSeconds, 
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