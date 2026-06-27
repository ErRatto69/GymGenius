using System.Security.Claims;
using GymGenius.Api.Domain.Entities;
using GymGenius.Api.Infrastructure.Persistence;
using GymGenius.Api.Resources;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace GymGenius.Api.Features.Workouts;

[Authorize]
[ApiController]
[Route("api/workouts/splits/{splitId}/workouts")]
public class WorkoutsController : ControllerBase
{
    private readonly GymDbContext _context;
    private readonly IStringLocalizer<SharedResource> _localizer;

    public WorkoutsController(GymDbContext context, IStringLocalizer<SharedResource> localizer)
    {
        _context = context;
        _localizer = localizer;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpPost]
    public async Task<IActionResult> AddWorkoutToSplit(Guid splitId, [FromBody] CreateWorkoutDto request)
    {
        var userId = GetUserId();
        var splitExists = await _context.Splits.AnyAsync(s => s.Id == splitId && s.UserId == userId);
        if (!splitExists) return NotFound(_localizer["SplitNotFound"].Value);

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

        return Ok(new { Message = _localizer["WorkoutAdded"].Value, WorkoutId = workout.Id });
    }

    [HttpPut("{workoutId}")]
    public async Task<IActionResult> UpdateWorkoutInSplit(Guid splitId, Guid workoutId, [FromBody] UpdateWorkoutDto request)
    {
        var userId = GetUserId();
        var isOwner = await _context.Splits.AnyAsync(s => s.Id == splitId && s.UserId == userId);
        if (!isOwner) return NotFound(_localizer["SplitNotFound"].Value);

        var workout = await _context.Workouts.FirstOrDefaultAsync(w => w.Id == workoutId && w.SplitId == splitId);
        if (workout == null) return NotFound(_localizer["WorkoutNotFound"].Value);

        workout.Name = request.Name;
        workout.DayOrder = request.DayOrder;
        workout.Notes = request.Notes;

        await _context.SaveChangesAsync();
        return Ok(new { Message = _localizer["WorkoutUpdated"].Value });
    }

    [HttpDelete("{workoutId}")]
    public async Task<IActionResult> DeleteWorkoutFromSplit(Guid splitId, Guid workoutId)
    {
        var userId = GetUserId();
        var isOwner = await _context.Splits.AnyAsync(s => s.Id == splitId && s.UserId == userId);
        if (!isOwner) return NotFound(_localizer["SplitNotFound"].Value);

        var workout = await _context.Workouts.FirstOrDefaultAsync(w => w.Id == workoutId && w.SplitId == splitId);
        if (workout == null) return NotFound(_localizer["WorkoutNotFound"].Value);

        _context.Workouts.Remove(workout);
        await _context.SaveChangesAsync();

        return Ok(new { Message = _localizer["WorkoutDeleted"].Value });
    }
}