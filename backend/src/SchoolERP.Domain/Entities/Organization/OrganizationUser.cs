using SchoolERP.Domain.Entities.Identity;

namespace SchoolERP.Domain.Entities.Organization;

public class OrganizationUser
{
    public Guid OrganizationId { get; set; }
    public Organization Organization { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid? CampusId { get; set; }
    public Campus? Campus { get; set; }

    public bool IsPrimary { get; set; } = true;
    public DateTime JoinedAtUtc { get; set; } = DateTime.UtcNow;
    public string? AssignedBy { get; set; }
}
