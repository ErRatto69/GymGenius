using System.Security.Claims;
using GymGenius.Api.Domain.Entities;
using GymGenius.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymGenius.Api.Features.Workouts;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class WorkoutsController : ControllerBase
{
    private readonly GymDbContext _context;

    public WorkoutsController(GymDbContext context)
    {
        _context = context;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    
    [HttpPost("splits")]
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
            Workouts = request.Workouts.Select(w => new Workout
            {
                Name = w.Name,
                DayOrder = w.Order,
                Notes = w.Notes,
                Exercises = w.Exercises.Select(e => new Exercise
                {
                    Name = e.Name,
                    Order = e.Order,
                    Notes = e.Notes,
                    Sets = e.Sets.Select(s => new Set
                    {
                        Number = s.Number,
                        TargetReps = s.TargetReps,
                        TargetRestSeconds = s.TargetRestSeconds,
                        TargetWeight = s.TargetWeight,
                        Notes = s.Notes
                    }).ToList()
                }).ToList()
            }).ToList()
        };

        _context.Splits.Add(split);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Scheda creata con successo!", SplitId = split.Id });
    }

    [HttpGet("splits")]
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
    
    [HttpGet("splits/{id}")]
    public async Task<IActionResult> GetSplitDetails(Guid id)
    {
        var userId = GetUserId();

        var split = await _context.Splits
            .Include(s => s.Workouts.OrderBy(w => w.DayOrder))
                .ThenInclude(w => w.Exercises.OrderBy(e => e.Order))
                    .ThenInclude(e => e.Sets.OrderBy(set => set.Number))
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (split == null) return NotFound("Scheda non trovata.");

        return Ok(split);
    }
    
    [HttpDelete("splits/{id}")]
    public async Task<IActionResult> DeleteSplit(Guid id)
    {
        var userId = GetUserId();
        var split = await _context.Splits.FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);
        
        if (split == null) return NotFound("Scheda non trovata.");

        _context.Splits.Remove(split);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Scheda eliminata." });
    }
    
    [HttpPost("splits/{splitId}/workouts")]
    public async Task<IActionResult> AddWorkoutToSplit(Guid splitId, [FromBody] CreateWorkoutDto request)
    {
        var userId = GetUserId();
        var split = await _context.Splits.FirstOrDefaultAsync(s => s.Id == splitId && s.UserId == userId);
        
        if (split == null) return NotFound("Scheda non trovata.");

        var workout = new Workout
        {
            SplitId = splitId,
            Name = request.Name,
            DayOrder = request.Order,
            Notes = request.Notes,
            Exercises = new List<Exercise>() // Parte vuoto!
        };

        _context.Workouts.Add(workout);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Allenamento aggiunto!", WorkoutId = workout.Id });
    }
}