namespace SchoolERP.Contracts.Identity;

public record LoginRequest(string Email, string Password);

public record LoginResponse(
    string AccessToken, 
    string RefreshToken, 
    DateTime ExpiresAtUtc,
    UserDto User);

public record RefreshTokenRequest(string AccessToken, string RefreshToken);

public record LogoutRequest(string RefreshToken);

public record ForgotPasswordRequest(string Email);

public record ResetPasswordRequest(string Email, string Token, string NewPassword);

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

public record UserProfileResponse(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string FullName,
    string? PhoneNumber,
    string? AvatarUrl,
    string? TenantId,
    IReadOnlyList<string> Roles,
    IReadOnlyList<string> Permissions);
