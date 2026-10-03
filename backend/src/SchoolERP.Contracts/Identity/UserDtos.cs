namespace SchoolERP.Contracts.Identity;

public record UserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string FullName,
    string? PhoneNumber,
    string? AvatarUrl,
    bool IsActive,
    bool EmailConfirmed,
    string? TenantId,
    DateTime? LastLoginAtUtc,
    IReadOnlyList<string> Roles);

public record UserDetailDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string FullName,
    string? PhoneNumber,
    string? AvatarUrl,
    bool IsActive,
    bool EmailConfirmed,
    string? TenantId,
    DateTime? LastLoginAtUtc,
    DateTime CreatedAtUtc,
    IReadOnlyList<string> Roles,
    IReadOnlyList<string> Permissions);

public record CreateUserRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? PhoneNumber = null,
    string? TenantId = null,
    List<string>? RoleNames = null);

public record UpdateUserRequest(
    string FirstName,
    string LastName,
    string? PhoneNumber = null,
    string? AvatarUrl = null,
    List<string>? RoleNames = null);

public record UpdateUserStatusRequest(bool IsActive);
