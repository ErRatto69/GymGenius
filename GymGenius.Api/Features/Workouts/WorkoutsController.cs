using System.Security.Claims;
using GymGenius.Api.Domain.Entities;
using GymGenius.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymGenius.Api.Features.Workouts;

[Authorize]
[ApiController]
[Route("api/splits")]
public class SplitsController : ControllerBase
{
    private readonly GymDbContext _context;

    public SplitsController(GymDbContext context)
    {
        _context = context;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    
    [HttpPost]
    public async Task<IActionResult> CreateSplit([FromBody] CreateSplitRequest request)
    {
        var userId = GetUserId();

        var split = new Split
        {
            UserId = userId,
            Title = request.Title,
            Description = request.Description,
            Goal = request.Goal,
            CycleLengthDays = request.CycleLengthDays,
            IsAiGenerated = false,
            Workouts = request.Workouts?.Select(w => new Workout
            {
                Name = w.Name,
                DayOrder = w.DayOrder,
                Notes = w.Notes,
                Exercises = w.Exercises?.Select(e => new Exercise
                {
                    Name = e.Name,
                    Order = e.Order,
                    Notes = e.Notes,
                    Sets = e.Sets?.Select(s => new Set
                    {
                        Number = s.Number,
                        TargetReps = s.TargetReps,
                        TargetRestSeconds = s.TargetRestSeconds,
                        TargetWeight = s.TargetWeight,
                        Notes = s.Notes
                    }).ToList() ?? new List<Set>()
                }).ToList() ?? new List<Exercise>()
            }).ToList() ?? new List<Workout>()
        };

        _context.Splits.Add(split);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Scheda creata con successo!", SplitId = split.Id });
    }

    [HttpGet]
    public async Task<ActionResult<List<SplitSummaryResponse>>> GetMySplits()
    {
        var userId = GetUserId();
        
        var splits = await _context.Splits
            .Where(s => s.UserId == userId && s.IsActive)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new SplitSummaryResponse(
                s.Id, s.Title, s.Goal, s.CycleLengthDays, s.IsAiGenerated, s.CreatedAt))
            .ToListAsync();

        return Ok(splits);
    }
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetSplitDetails(Guid id)
    {
        var userId = GetUserId();

        var split = await _context.Splits
            .Include(s => s.Workouts.OrderBy(w => w.DayOrder))
                .ThenInclude(w => w.Exercises.OrderBy(e => e.Order))
                    .ThenInclude(e => e.Sets.OrderBy(set => set.Number))
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (split == null) return NotFound("Scheda non trovata.");

        var response = new SplitDetailsResponse(
            split.Id,
            split.Title,
            split.Description,
            split.Goal,
            split.CycleLengthDays,
            split.IsAiGenerated,
            split.CreatedAt,
            split.Workouts.Select(w => new WorkoutDetailsResponse(
                w.Id,
                w.Name,
                w.DayOrder,
                w.Notes,
                w.Exercises.Select(e => new ExerciseDetailsResponse(
                    e.Id,
                    e.Name,
                    e.Order,
                    e.Notes,
                    e.Sets.Select(s => new SetDetailsResponse(
                        s.Id,
                        s.Number,
                        s.TargetReps,
                        s.TargetRestSeconds,
                        s.TargetWeight,
                        s.Notes
                    )).ToList()
                )).ToList()
            )).ToList()
        );

        return Ok(response);
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSplit(Guid id)
    {
        var userId = GetUserId();
        var split = await _context.Splits.FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);
        
        if (split == null) return NotFound("Scheda non trovata.");

        _context.Splits.Remove(split);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Scheda eliminata." });
    }
    
    [HttpPost("{splitId}/workouts")]
    public async Task<IActionResult> AddWorkoutToSplit(Guid splitId, [FromBody] CreateWorkoutDto request)
    {
        var userId = GetUserId();
        var split = await _context.Splits.FirstOrDefaultAsync(s => s.Id == splitId && s.UserId == userId);
        
        if (split == null) return NotFound("Scheda non trovata.");

        var workout = new Workout
        {
            SplitId = splitId,
            Name = request.Name,
            DayOrder = request.DayOrder,
            Notes = request.Notes,
            Exercises = request.Exercises?.Select(e => new Exercise
            {
                Name = e.Name,
                Order = e.Order,
                Notes = e.Notes,
                Sets = e.Sets?.Select(s => new Set
                {
                    Number = s.Number,
                    TargetReps = s.TargetReps,
                    TargetRestSeconds = s.TargetRestSeconds,
                    TargetWeight = s.TargetWeight,
                    Notes = s.Notes
                }).ToList() ?? new List<Set>()
            }).ToList() ?? new List<Exercise>()
        };

        _context.Workouts.Add(workout);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Allenamento aggiunto!", WorkoutId = workout.Id });
    }
    
    [HttpPut("{splitId}/workouts/{workoutId}")]
    public async Task<IActionResult> UpdateWorkoutInSplit(Guid splitId, Guid workoutId, [FromBody] UpdateWorkoutDto request)
    {
        var userId = GetUserId();
        
        var isOwner = await _context.Splits.AnyAsync(s => s.Id == splitId && s.UserId == userId);
        if (!isOwner) return NotFound("Scheda non trovata.");

        var workout = await _context.Workouts.FirstOrDefaultAsync(w => w.Id == workoutId && w.SplitId == splitId);
        if (workout == null) return NotFound("Allenamento non trovato.");
        
        workout.Name = request.Name;
        workout.DayOrder = request.DayOrder;
        workout.Notes = request.Notes;

        await _context.SaveChangesAsync();
        return Ok(new { Message = "Allenamento aggiornato con successo!" });
    }
    
    [HttpDelete("{splitId}/workouts/{workoutId}")]
    public async Task<IActionResult> DeleteWorkoutFromSplit(Guid splitId, Guid workoutId)
    {
        var userId = GetUserId();

        // Controllo di sicurezza preventivo sulla titolarità della scheda
        var isOwner = await _context.Splits.AnyAsync(s => s.Id == splitId && s.UserId == userId);
        if (!isOwner) return NotFound("Scheda non trovata.");

        var workout = await _context.Workouts.FirstOrDefaultAsync(w => w.Id == workoutId && w.SplitId == splitId);
        if (workout == null) return NotFound("Allenamento non trovato.");

        _context.Workouts.Remove(workout);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Allenamento eliminato dalla scheda con successo!" });
    }
}