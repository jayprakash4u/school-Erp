namespace SchoolERP.Contracts.Organization;

public record CampusDto(
    Guid Id,
    Guid OrganizationId,
    string Code,
    string Name,
    string? Address,
    string? City,
    string? State,
    string? Country,
    string? PostalCode,
    string? Phone,
    string? Email,
    bool IsMainCampus,
    bool IsActive,
    DateTime CreatedAtUtc);

public record CreateCampusRequest(
    string Code,
    string Name,
    string? Address = null,
    string? City = null,
    string? State = null,
    string? Country = null,
    string? PostalCode = null,
    string? Phone = null,
    string? Email = null,
    bool IsMainCampus = false);

public record UpdateCampusRequest(
    string Name,
    string? Address = null,
    string? City = null,
    string? State = null,
    string? Country = null,
    string? PostalCode = null,
    string? Phone = null,
    string? Email = null,
    bool IsMainCampus = false);

public record UpdateCampusStatusRequest(bool IsActive);
