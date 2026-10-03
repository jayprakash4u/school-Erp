using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Identity;

namespace SchoolERP.Domain.Entities.Communication;

public class DirectMessage : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid SenderUserId { get; set; }
    public User? SenderUser { get; set; }

    public Guid RecipientUserId { get; set; }
    public User? RecipientUser { get; set; }

    public string Subject { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime? ReadAtUtc { get; set; }
    public DateTime SentAtUtc { get; set; }

    public DirectMessage()
    {
        Id = Guid.NewGuid();
    }

    public DirectMessage(
        Guid organizationId,
        Guid senderUserId,
        Guid recipientUserId,
        string subject,
        string content,
        DateTime sentAtUtc,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        SenderUserId = senderUserId;
        RecipientUserId = recipientUserId;
        Subject = subject;
        Content = content;
        SentAtUtc = sentAtUtc;
        IsRead = false;
    }

    public void MarkAsRead()
    {
        IsRead = true;
        ReadAtUtc = DateTime.UtcNow;
    }
}
