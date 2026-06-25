using System.ComponentModel.DataAnnotations;

namespace GymGenius.Api.Features.Workouts;

public record CreateSetDto(
    [Range(1, 50)] int Number, 
    [Required] string TargetReps, 
    [Range(0, 600)] int TargetRestSeconds, 
    string? TargetWeight, 
    string? Notes
);

public record UpdateSetDto(
    [Range(1, 50)] int Number,
    [Required] string TargetReps,
    [Range(0, 600)] int TargetRestSeconds,
    string? TargetWeight,
    string? Notes
);

public record SetDetailsResponse(
    Guid Id,
    int Number,
    string TargetReps,
    int TargetRestSeconds,
    string? TargetWeight,
    string? Notes
);