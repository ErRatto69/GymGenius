using System.ComponentModel.DataAnnotations;

namespace GymGenius.Api.Features.Auth;

public record RegisterRequest(
    [Required(ErrorMessage = "AuthModelsEmailRequired")]
    [EmailAddress(ErrorMessage = "AuthModelsEmailFormatInvalid")]
    string Email,
    
    [Required(ErrorMessage = "AuthModelsUsernameRequired")]
    [MinLength(4, ErrorMessage = "AuthModelsUsernameMinLength")]
    string Username, 
    
    [Required(ErrorMessage = "AuthModelsPasswordRequired")]
    [RegularExpression(@"^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", ErrorMessage = "AuthModelsPasswordTooWeak")]
    string Password, 
    
    [Required(ErrorMessage = "AuthModelsFirstNameRequired")]
    [MinLength(2, ErrorMessage = "AuthModelsFirstNameMinLength")]
    string FirstName, 
    
    [Required(ErrorMessage = "AuthModelsLastNameRequired")]
    [MinLength(2, ErrorMessage = "AuthModelsLastNameMinLength")]
    string LastName, 
    
    List<string>? PreferredFoods,
    List<string>? DislikedFoods,
    List<string>? Allergies,
    List<string>? Injuries,
    string? FitnessGoal,
    string? AvailableEquipment
);

public record LoginRequest(
    [Required(ErrorMessage = "AuthModelsUserOrEmailRequired")]
    string UsernameOrEmail, 
    
    [Required(ErrorMessage = "AuthModelsPasswordRequired")]
    string Password
);

public record AuthResponse(
    string AccessToken, 
    string RefreshToken, 
    string Email, 
    string Username,
    string FirstName, 
    string LastName
);