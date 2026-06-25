using System.Security.Claims;
using GymGenius.Api.Domain.Entities;
using GymGenius.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymGenius.Api.Features.Workouts;

[Authorize]
[ApiController]
[Route("api/workouts/splits/{splitId}/workouts/{workoutId}/exercises")]
public class ExercisesController : ControllerBase
{
    private readonly GymDbContext _context;

    public ExercisesController(GymDbContext context) => _context = context;

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpPost]
    public async Task<IActionResult> AddExerciseToWorkout(Guid splitId, Guid workoutId, [FromBody] CreateExerciseDto request)
    {
        var userId = GetUserId();
        var isOwner = await _context.Splits.AnyAsync(s => s.Id == splitId && s.UserId == userId);
        if (!isOwner) return NotFound("Scheda non trovata.");

        var workoutExists = await _context.Workouts.AnyAsync(w => w.Id == workoutId && w.SplitId == splitId);
        if (!workoutExists) return NotFound("Allenamento non trovato.");

        var exercise = new Exercise
        {
            WorkoutId = workoutId,
            Name = request.Name,
            Order = request.Order,
            Notes = request.Notes,
            Sets = request.Sets?.Select(s => new Set
            {
                Number = s.Number,
                TargetReps = s.TargetReps,
                TargetRestSeconds = s.TargetRestSeconds,
                TargetWeight = s.TargetWeight,
                Notes = s.Notes
            }).ToList() ?? new List<Set>()
        };

        _context.Exercises.Add(exercise);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Esercizio aggiunto con successo!", ExerciseId = exercise.Id });
    }

    [HttpPut("{exerciseId}")]
    public async Task<IActionResult> UpdateExercise(Guid splitId, Guid workoutId, Guid exerciseId, [FromBody] UpdateExerciseDto request)
    {
        var userId = GetUserId();
        var isOwner = await _context.Splits.AnyAsync(s => s.Id == splitId && s.UserId == userId);
        if (!isOwner) return NotFound("Scheda non trovata.");

        var exercise = await _context.Exercises
            .FirstOrDefaultAsync(e => e.Id == exerciseId && e.WorkoutId == workoutId && e.Workout.SplitId == splitId);
        
        if (exercise == null) return NotFound("Esercizio non trovato.");

        exercise.Name = request.Name;
        exercise.Order = request.Order;
        exercise.Notes = request.Notes;

        await _context.SaveChangesAsync();
        return Ok(new { Message = "Esercizio aggiornato con successo!" });
    }

    [HttpDelete("{exerciseId}")]
    public async Task<IActionResult> DeleteExercise(Guid splitId, Guid workoutId, Guid exerciseId)
    {
        var userId = GetUserId();
        var isOwner = await _context.Splits.AnyAsync(s => s.Id == splitId && s.UserId == userId);
        if (!isOwner) return NotFound("Scheda non trovata.");

        var exercise = await _context.Exercises
            .FirstOrDefaultAsync(e => e.Id == exerciseId && e.WorkoutId == workoutId && e.Workout.SplitId == splitId);
        
        if (exercise == null) return NotFound("Esercizio non trovato.");

        _context.Exercises.Remove(exercise);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Esercizio eliminato con successo!" });
    }
}