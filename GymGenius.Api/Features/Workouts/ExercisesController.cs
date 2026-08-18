using System.Security.Claims;
using GymGenius.Api.Domain.Entities;
using GymGenius.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymGenius.Api.Features.Workouts;

[Authorize]
[ApiController]
[Route("api/workouts")]
public class ExercisesController : ControllerBase
{
    private readonly GymDbContext _context;

    public ExercisesController(GymDbContext context) => _context = context;

    private string GetUserId() => 
        User.FindFirstValue(ClaimTypes.NameIdentifier) 
        ?? User.FindFirst("sub")?.Value 
        ?? string.Empty;

    // Catalogo integrato in Italiano con illustrazioni/GIF funzionanti
    private static readonly List<ExerciseLibraryItem> ExerciseCatalog = new()
    {
        // PETTO
        new("01", "Panca Piana con Bilanciere", "Petto", "Bilanciere", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg", new() { "Sdraiati sulla panca piana", "Impugna il bilanciere con presa poco più larga delle spalle", "Scendi controllando fino al petto e distendi" }),
        new("02", "Panca Inclinata con Manubri", "Petto", "Manubri", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/0.jpg", new() { "Panca inclinata a 30-45 gradi", "Spingi i manubri verso l'alto", "Scendi controllando la discesa" }),
        new("03", "Croci ai Cavi", "Petto", "Cavi", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg", new() { "Porta le maniglie avanti al petto contraendo i pettorali", "Riapri lentamente con gomiti morbidi" }),
        new("04", "Dip alle Parallele", "Petto / Tricipiti", "Corpo Libero", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chest_Dip/0.jpg", new() { "Inclinati leggermente in avanti", "Scendi a 90 gradi al gomito e risali" }),
        new("05", "Push-up (Piegamenti)", "Petto", "Corpo Libero", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushups/0.jpg", new() { "Corpo allineato", "Scendi sfiorando il pavimento e spingi" }),

        // DORSO / SCHIENA
        new("06", "Stacco da Terra con Bilanciere", "Dorso / Schiena", "Bilanciere", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/0.jpg", new() { "Piedi larghezza spalle, schiena dritta", "Spingi con le gambe e serra il bacino in alto" }),
        new("07", "Trazioni alla Sbarra (Pull-up)", "Dorsali", "Corpo Libero", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pullups/0.jpg", new() { "Presa prona", "Tira fino a superare la sbarra con il mento" }),
        new("08", "Lat Machine Avanti", "Dorsali", "Cavi / Macchina", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Underhand_Pulldown/0.jpg", new() { "Siediti bloccando le cosce", "Tira la sbarra al petto e rilascia controllando" }),
        new("09", "Rematore con Bilanciere", "Dorso", "Bilanciere", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/0.jpg", new() { "Busto a 45 gradi", "Tira il bilanciere verso l'ombelico" }),
        new("10", "Pulley Basso", "Dorso", "Cavi", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/0.jpg", new() { "Schiena dritta, tira verso la pancia e adduci le scapole" }),

        // GAMBE
        new("11", "Squat con Bilanciere", "Quadricipiti / Glutei", "Bilanciere", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Full_Squat/0.jpg", new() { "Bilanciere sui trapezi", "Scendi rompendo il parallelo e risali spingendo sui talloni" }),
        new("12", "Leg Press 45°", "Quadricipiti", "Macchinario", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg", new() { "Piedi a larghezza spalle", "Scendi fino a 90° e distendi senza bloccare le ginocchia" }),
        new("13", "Leg Extension", "Quadricipiti", "Macchinario", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/0.jpg", new() { "Estendi le gambe contraendo i quadricipiti" }),
        new("14", "Leg Curl Sdraiato", "Femorali", "Macchinario", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/0.jpg", new() { "Fletti le gambe portando i cuscinetti verso i glutei" }),
        new("15", "Affondi con Manubri", "Gambe / Glutei", "Manubri", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lunges/0.jpg", new() { "Passo lungo avanti, scendi con il ginocchio posteriore quasi a terra" }),
        new("16", "Calf Raise in Piedi", "Polpacci", "Macchinario", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/0.jpg", new() { "Sollevati sulla punta dei piedi contraendo i polpacci" }),

        // SPALLE
        new("17", "Military Press (Lento Avanti)", "Spalle", "Bilanciere", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Military_Press/0.jpg", new() { "Bilanciere al petto", "Spingi verso l'alto sopra la testa bloccando l'addome" }),
        new("18", "Spinte Spalle con Manubri", "Spalle", "Manubri", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shoulder_Press/0.jpg", new() { "Seduto su panca", "Spingi i manubri sopra la testa" }),
        new("19", "Alzate Laterali con Manubri", "Spalle (Deltoide Lat.)", "Manubri", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/0.jpg", new() { "Solleva i manubri fino all'altezza delle spalle" }),
        new("20", "Face Pull al Cavo", "Deltoidi Post. / Schiena", "Cavi", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/0.jpg", new() { "Tira la corda verso il viso allargando i gomiti" }),

        // BRACCIA
        new("21", "Curl Bicipiti con Manubri", "Bicipiti", "Manubri", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bicep_Curl/0.jpg", new() { "Fletti le braccia ruotando i polsi verso l'alto" }),
        new("22", "Curl con Bilanciere EZ", "Bicipiti", "Bilanciere", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/EZ-Bar_Curl/0.jpg", new() { "Gomiti fermi ai fianchi, solleva il bilanciere" }),
        new("23", "Curl a Martello (Hammer Curl)", "Bicipiti / Avambracci", "Manubri", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/0.jpg", new() { "Presa neutra con i palmi rivolti all'interno" }),
        new("24", "Pushdown Tricipiti al Cavo", "Tricipiti", "Cavi", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Pushdown/0.jpg", new() { "Gomiti fermi, spingi la barra o corda verso il basso" }),
        new("25", "French Press con Bilanciere", "Tricipiti", "Bilanciere", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/EZ-Bar_Skullcrusher/0.jpg", new() { "Sdraiati su panca, piega le braccia portando il bilanciere alla fronte" }),

        // ADDOME
        new("26", "Crunch a Terra", "Addominali", "Corpo Libero", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunch_-_Hands_Overhead/0.jpg", new() { "Stacca le scapole dal pavimento espirando" }),
        new("27", "Plank Addominale", "Core / Addome", "Corpo Libero", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg", new() { "Corpo dritto in appoggio sui gomiti e punte dei piedi" }),
        new("28", "Leg Raise alla Sbarra", "Addome Basso", "Corpo Libero", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/0.jpg", new() { "Appeso alla sbarra, solleva le ginocchia o gambe al petto" })
    };

    [HttpGet("library")]
    public IActionResult GetLibrary([FromQuery] string? search = null)
    {
        var list = ExerciseCatalog.AsEnumerable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = search.Trim();
            list = list.Where(e => 
                e.Name.Contains(q, StringComparison.OrdinalIgnoreCase) ||
                e.TargetMuscle.Contains(q, StringComparison.OrdinalIgnoreCase) ||
                e.Equipment.Contains(q, StringComparison.OrdinalIgnoreCase));
        }

        return Ok(list.ToList());
    }

    [HttpPost("splits/{splitId}/workouts/{workoutId}/exercises")]
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
            GifUrl = request.GifUrl,
            TargetMuscle = request.TargetMuscle,
            Equipment = request.Equipment,
            Sets = request.Sets?.Select(s => new Set
            {
                Number = s.Number,
                TargetReps = s.TargetReps,
                TargetRestSeconds = s.TargetRestSeconds,
                TargetWeight = s.TargetWeight,
                Notes = s.Notes
            }).ToList() ?? new List<Set>
            {
                new() { Number = 1, TargetReps = "10", TargetRestSeconds = 90, TargetWeight = "0" },
                new() { Number = 2, TargetReps = "10", TargetRestSeconds = 90, TargetWeight = "0" },
                new() { Number = 3, TargetReps = "10", TargetRestSeconds = 90, TargetWeight = "0" }
            }
        };

        _context.Exercises.Add(exercise);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Esercizio aggiunto con successo!", ExerciseId = exercise.Id });
    }

    [HttpDelete("splits/{splitId}/workouts/{workoutId}/exercises/{exerciseId}")]
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

public record ExerciseLibraryItem(
    string Id,
    string Name,
    string TargetMuscle,
    string Equipment,
    string ImageUrl,
    List<string> Instructions
);