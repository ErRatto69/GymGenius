using GymGenius.Api.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace GymGenius.Api.Features.Auth;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly ITokenService _tokenService;

    public AuthController(UserManager<User> userManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (await _userManager.FindByEmailAsync(request.Email) != null) return BadRequest("Email già registrata.");
        if (await _userManager.FindByNameAsync(request.Username) != null) return BadRequest("Username già in uso.");

        var user = new User
        {
            UserName = request.Username,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PreferredFoods = request.PreferredFoods ?? new(),
            DislikedFoods = request.DislikedFoods ?? new(),
            Allergies = request.Allergies ?? new(),
            Injuries = request.Injuries ?? new(),
            FitnessGoal = request.FitnessGoal,
            AvailableEquipment = request.AvailableEquipment
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded) return BadRequest(result.Errors);
        return Ok(new { Message = "Utente creato." });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var user = request.UsernameOrEmail.Contains('@') 
            ? await _userManager.FindByEmailAsync(request.UsernameOrEmail)
            : await _userManager.FindByNameAsync(request.UsernameOrEmail);
        
        if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
            return Unauthorized("Credenziali non valide.");

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _userManager.UpdateAsync(user);

        return Ok(new AuthResponse(
            accessToken, refreshToken, user.Email!, user.UserName!,
            user.FirstName ?? "", user.LastName ?? "",
            user.PreferredFoods, user.DislikedFoods, user.Allergies, 
            user.Injuries, user.FitnessGoal, user.AvailableEquipment
        ));
    }
}