using System.Security.Claims;
using System.Text.Json;
using System.Text.RegularExpressions;
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
    
    private static readonly HttpClient _httpClient = new HttpClient();

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

        var muscles = request.MuscleIds != null 
            ? await _context.Set<Muscle>().Where(m => request.MuscleIds.Contains(m.Id)).ToListAsync()
            : new List<Muscle>();
        
        var exercise = new Exercise
        {
            WorkoutId = workoutId,
            Name = request.Name,
            Order = request.Order,
            Notes = request.Notes,
            Muscles = muscles,
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
            .Include(e => e.Muscles)
            .FirstOrDefaultAsync(e => e.Id == exerciseId && e.WorkoutId == workoutId && e.Workout.SplitId == splitId);
        
        if (exercise == null) return NotFound("Esercizio non trovato.");

        if (request.MuscleIds != null)
        {
            var updatedMuscles = await _context.Set<Muscle>().Where(m => request.MuscleIds.Contains(m.Id)).ToListAsync();
            exercise.Muscles = updatedMuscles;
        }
        
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
    
    [HttpGet("/api/workouts/exercises/search")]
    public async Task<IActionResult> SearchLocalExercisesByMuscle([FromQuery] string muscleName)
    {
        var userId = GetUserId();

        if (string.IsNullOrWhiteSpace(muscleName))
            return BadRequest("Il nome del muscolo per il filtro è obbligatorio.");
        
        var exercises = await _context.Exercises
            .Where(e => e.Workout.Split.UserId == userId && 
                        e.Muscles.Any(m => m.Name.ToLower().Contains(muscleName.ToLower())))
            .Select(e => new { e.Id, e.Name, e.Order, e.Notes, WorkoutName = e.Workout.Name })
            .ToListAsync();

        return Ok(exercises);
    }
    
    [HttpGet("/api/workouts/library")]
    public async Task<IActionResult> GetOnlineLibrary([FromQuery] int limit = 30)
    {
        try
        {
            var url = $"https://wger.de/api/v2/exercise/?limit={limit}";
            
            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
                return StatusCode((int)response.StatusCode, "Impossibile recuperare i dati dalla libreria di esercizi online.");

            var jsonString = await response.Content.ReadAsStringAsync();
            var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower };
            var wgerData = JsonSerializer.Deserialize<WgerApiResponse>(jsonString, jsonOptions);

            if (wgerData?.Results == null) return Ok(new List<object>());
            
            var cleanedExercises = wgerData.Results.Select(e => new
            {
                ExternalId = e.Id,
                Name = e.Name,
                Description = Regex.Replace(e.Description ?? "", "<.*?>", string.Empty).Trim()
            }).ToList();

            return Ok(cleanedExercises);
        }
        catch (Exception)
        {
            return StatusCode(503, "Il servizio di libreria esterna non è temporaneamente raggiungibile.");
        }
    }
    
    [HttpPost("import")]
    public async Task<IActionResult> ImportExerciseToWorkout(Guid splitId, Guid workoutId, [FromBody] ImportExerciseLibraryRequest request)
    {
        var userId = GetUserId();
        var isOwner = await _context.Splits.AnyAsync(s => s.Id == splitId && s.UserId == userId);
        if (!isOwner) return NotFound("Scheda non trovata.");
        
        var workoutExists = await _context.Workouts.AnyAsync(w => w.Id == workoutId && w.SplitId == splitId);
        if (!workoutExists) return NotFound("Allenamento non trovato.");

        var muscles = request.MuscleIds != null 
            ? await _context.Set<Muscle>().Where(m => request.MuscleIds.Contains(m.Id)).ToListAsync()
            : new List<Muscle>();

        var exercise = new Exercise
        {
            WorkoutId = workoutId,
            Name = request.Name,
            Order = request.Order,
            Notes = request.Notes,
            Muscles = muscles,
            Sets = new List<Set>() 
        };

        _context.Exercises.Add(exercise);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Esercizio della libreria online importato e salvato con successo!", ExerciseId = exercise.Id });
    }
}