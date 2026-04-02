using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace GymGenius.Api.Features.AI;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AIController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly HttpClient _http;

    public AIController(IConfiguration config, IHttpClientFactory factory)
    {
        _config = config;
        _http = factory.CreateClient();
    }

    [HttpPost("generate-workout")]
    public async Task<IActionResult> GenerateWorkout([FromBody] WorkoutPromptRequest request)
    {
        var apiKey = _config["Gemini:ApiKey"];
        var prompt = $"Agisci come un Master Personal Trainer. Crea una scheda di allenamento per un utente con obiettivo {request.Goal}, " +
                     $"livello {request.Level} e {request.DaysPerWeek} giorni a disposizione. Rispondi ESCLUSIVAMENTE in formato JSON strutturato.";
        
        return Ok(new { 
            Title = "Piano Personalizzato AI",
            Exercises = new[] { new { Name = "Panca Piana", Reps = "4x8" } } 
        });
    }
}

public record WorkoutPromptRequest(string Goal, string Level, int DaysPerWeek);