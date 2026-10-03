using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Identity;

namespace SchoolERP.Domain.Entities.Communication;

public class Notification : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid UserId { get; set; }
    public User? User { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? ActionUrl { get; set; }
    public string? Category { get; set; } // e.g. "Fee", "Exam", "Attendance", "Hostel", "Transport"
    public bool IsRead { get; set; }
    public DateTime? ReadAtUtc { get; set; }

    public Notification()
    {
        Id = Guid.NewGuid();
    }

    public Notification(
        Guid organizationId,
        Guid userId,
        string title,
        string message,
        string? actionUrl = null,
        string? category = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        UserId = userId;
        Title = title;
        Message = message;
        ActionUrl = actionUrl;
        Category = category;
        IsRead = false;
    }

    public void MarkAsRead()
    {
        IsRead = true;
        ReadAtUtc = DateTime.UtcNow;
    }
}
