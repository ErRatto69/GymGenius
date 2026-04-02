using GymGenius.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace GymGenius.Api.Features.Profile;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly UserManager<User> _userManager;

    public ProfileController(UserManager<User> userManager) => _userManager = userManager;

    [HttpPut("update")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userEmail = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
        if (userEmail == null) return Unauthorized();

        var user = await _userManager.FindByEmailAsync(userEmail);
        if (user == null) return NotFound();

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.PreferredFoods = request.PreferredFoods ?? new();
        user.DislikedFoods = request.DislikedFoods ?? new();
        user.Allergies = request.Allergies ?? new();
        user.Injuries = request.Injuries ?? new();
        user.FitnessGoal = request.FitnessGoal;
        user.AvailableEquipment = request.AvailableEquipment;

        await _userManager.UpdateAsync(user);

        return Ok(new { 
            Message = "Profilo aggiornato.",
            User = new { 
                user.Email, user.UserName, user.FirstName, user.LastName,
                user.PreferredFoods, user.DislikedFoods, user.Allergies, user.Injuries,
                user.FitnessGoal, user.AvailableEquipment
            }
        });
    }
}

public record UpdateProfileRequest(
    string FirstName, string LastName, 
    List<string>? PreferredFoods, List<string>? DislikedFoods, 
    List<string>? Allergies, List<string>? Injuries, 
    string? FitnessGoal, string? AvailableEquipment
);