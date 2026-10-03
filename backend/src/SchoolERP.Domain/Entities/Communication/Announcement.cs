using SchoolERP.Contracts.Communication;
using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Identity;
using SchoolERP.Domain.Entities.Staff;
using SchoolERP.Domain.Entities.Students;

namespace SchoolERP.Domain.Entities.Communication;

public class Announcement : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public AnnouncementPriority Priority { get; set; } = AnnouncementPriority.Normal;
    public TargetAudienceType TargetAudience { get; set; } = TargetAudienceType.All;

    public Guid? ProgramId { get; set; }
    public Domain.Entities.Academics.Program? Program { get; set; }

    public Guid? SectionId { get; set; }
    public Section? Section { get; set; }

    public Guid PublishedByUserId { get; set; }
    public User? PublishedByUser { get; set; }

    public DateTime PublishDateUtc { get; set; }
    public DateTime? ExpiryDateUtc { get; set; }
    public bool IsPublished { get; set; } = true;
    public bool SendEmail { get; set; }
    public bool SendSms { get; set; }

    public ICollection<AnnouncementRecipient> Recipients { get; set; } = new List<AnnouncementRecipient>();

    public Announcement()
    {
        Id = Guid.NewGuid();
    }

    public Announcement(
        Guid organizationId,
        string title,
        string content,
        AnnouncementPriority priority,
        TargetAudienceType targetAudience,
        Guid publishedByUserId,
        DateTime publishDateUtc,
        Guid? programId = null,
        Guid? sectionId = null,
        DateTime? expiryDateUtc = null,
        bool sendEmail = false,
        bool sendSms = false,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        Title = title;
        Content = content;
        Priority = priority;
        TargetAudience = targetAudience;
        PublishedByUserId = publishedByUserId;
        PublishDateUtc = publishDateUtc;
        ProgramId = programId;
        SectionId = sectionId;
        ExpiryDateUtc = expiryDateUtc;
        SendEmail = sendEmail;
        SendSms = sendSms;
        IsPublished = true;
    }
}

public class AnnouncementRecipient : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid AnnouncementId { get; set; }
    public Announcement Announcement { get; set; } = null!;

    public RecipientType RecipientType { get; set; } = RecipientType.User;

    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public Guid? StudentId { get; set; }
    public Student? Student { get; set; }

    public Guid? GuardianId { get; set; }
    public Guardian? Guardian { get; set; }

    public Guid? StaffId { get; set; }
    public SchoolERP.Domain.Entities.Staff.Staff? Staff { get; set; }

    public string? RecipientName { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }

    public DeliveryStatus Status { get; set; } = DeliveryStatus.Pending;
    public DateTime? ReadAtUtc { get; set; }

    public AnnouncementRecipient()
    {
        Id = Guid.NewGuid();
    }

    public AnnouncementRecipient(
        Guid organizationId,
        Guid announcementId,
        RecipientType recipientType,
        Guid? userId = null,
        Guid? studentId = null,
        Guid? guardianId = null,
        Guid? staffId = null,
        string? recipientName = null,
        string? email = null,
        string? phoneNumber = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        AnnouncementId = announcementId;
        RecipientType = recipientType;
        UserId = userId;
        StudentId = studentId;
        GuardianId = guardianId;
        StaffId = staffId;
        RecipientName = recipientName;
        Email = email;
        PhoneNumber = phoneNumber;
        Status = DeliveryStatus.Sent;
    }
}
