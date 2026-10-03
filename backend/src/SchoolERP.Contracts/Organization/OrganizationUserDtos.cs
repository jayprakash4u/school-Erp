using SchoolERP.Contracts.Identity;

namespace SchoolERP.Contracts.Organization;

public record OrganizationUserDto(
    Guid UserId,
    string Email,
    string FullName,
    Guid OrganizationId,
    string OrganizationName,
    Guid? CampusId,
    string? CampusName,
    bool IsPrimary,
    DateTime JoinedAtUtc,
    IReadOnlyList<string> Roles);

public record AssignUserToOrgRequest(
    Guid UserId,
    Guid? CampusId = null,
    bool IsPrimary = true);
