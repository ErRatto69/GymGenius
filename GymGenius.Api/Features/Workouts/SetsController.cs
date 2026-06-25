using System.Security.Claims;
using GymGenius.Api.Domain.Entities;
using GymGenius.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymGenius.Api.Features.Workouts;

[Authorize]
[ApiController]
[Route("api/workouts/splits/{splitId}/workouts/{workoutId}/exercises/{exerciseId}/sets")]
public class SetsController : ControllerBase
{
    private readonly GymDbContext _context;

    public SetsController(GymDbContext context) => _context = context;

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpPost]
    public async Task<IActionResult> AddSetToExercise(Guid splitId, Guid workoutId, Guid exerciseId, [FromBody] CreateSetDto request)
    {
        var userId = GetUserId();
        var isOwner = await _context.Splits.AnyAsync(s => s.Id == splitId && s.UserId == userId);
        if (!isOwner) return NotFound("Scheda non trovata.");

        var exerciseExists = await _context.Exercises
            .AnyAsync(e => e.Id == exerciseId && e.WorkoutId == workoutId && e.Workout.SplitId == splitId);
        if (!exerciseExists) return NotFound("Esercizio non trovato.");

        var set = new Set
        {
            ExerciseId = exerciseId,
            Number = request.Number,
            TargetReps = request.TargetReps,
            TargetRestSeconds = request.TargetRestSeconds,
            TargetWeight = request.TargetWeight,
            Notes = request.Notes
        };

        _context.Sets.Add(set);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Set aggiunto con successo!", SetId = set.Id });
    }

    [HttpPut("{setId}")]
    public async Task<IActionResult> UpdateSet(Guid splitId, Guid workoutId, Guid exerciseId, Guid setId, [FromBody] UpdateSetDto request)
    {
        var userId = GetUserId();
        var isOwner = await _context.Splits.AnyAsync(s => s.Id == splitId && s.UserId == userId);
        if (!isOwner) return NotFound("Scheda non trovata.");

        var set = await _context.Sets
            .FirstOrDefaultAsync(s => s.Id == setId && s.ExerciseId == exerciseId && s.Exercise.WorkoutId == workoutId && s.Exercise.Workout.SplitId == splitId);
        
        if (set == null) return NotFound("Set non trovato.");

        set.Number = request.Number;
        set.TargetReps = request.TargetReps;
        set.TargetRestSeconds = request.TargetRestSeconds;
        set.TargetWeight = request.TargetWeight;
        set.Notes = request.Notes;

        await _context.SaveChangesAsync();
        return Ok(new { Message = "Set aggiornato con successo!" });
    }

    [HttpDelete("{setId}")]
    public async Task<IActionResult> DeleteSet(Guid splitId, Guid workoutId, Guid exerciseId, Guid setId)
    {
        var userId = GetUserId();
        var isOwner = await _context.Splits.AnyAsync(s => s.Id == splitId && s.UserId == userId);
        if (!isOwner) return NotFound("Scheda non trovata.");

        var set = await _context.Sets
            .FirstOrDefaultAsync(s => s.Id == setId && s.ExerciseId == exerciseId && s.Exercise.WorkoutId == workoutId && s.Exercise.Workout.SplitId == splitId);
        
        if (set == null) return NotFound("Set non trovato.");

        _context.Sets.Remove(set);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Set eliminato con successo!" });
    }
}