namespace SchoolERP.Application.Common.Interfaces;

public interface ICurrentUserService
{
    string? UserId { get; }
    string? Email { get; }
    string? Role { get; }
    IReadOnlyList<string> Roles { get; }
    IReadOnlyList<string> Permissions { get; }
    string? TenantId { get; }
    Guid? OrganizationId { get; }
    Guid? CampusId { get; }
    bool IsAuthenticated { get; }

    bool HasPermission(string permission);
    bool IsInRole(string role);
}
