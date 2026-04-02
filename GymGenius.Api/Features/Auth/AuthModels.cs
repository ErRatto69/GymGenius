namespace GymGenius.Api.Features.Auth;

public record RegisterRequest(
    string Email, 
    string Username, 
    string Password, 
    string FirstName, 
    string LastName, 
    List<string>? PreferredFoods,
    List<string>? DislikedFoods,
    List<string>? Allergies,
    List<string>? Injuries,
    string? FitnessGoal,
    string? AvailableEquipment
);

public record LoginRequest(string UsernameOrEmail, string Password);

public record AuthResponse(
    string AccessToken, 
    string RefreshToken, 
    string Email, 
    string Username,
    string FirstName, 
    string LastName,
    List<string>? PreferredFoods,
    List<string>? DislikedFoods,
    List<string>? Allergies,
    List<string>? Injuries,
    string? FitnessGoal,
    string? AvailableEquipment
);