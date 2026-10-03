namespace SchoolERP.Contracts.Communication;

// --- Template ---
public record CommunicationTemplateDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string Code,
    string Name,
    TemplateType TemplateType,
    CommunicationChannel Channel,
    string SubjectTemplate,
    string BodyTemplate,
    bool IsActive);

public record CreateCommunicationTemplateRequest(
    string Code,
    string Name,
    TemplateType TemplateType,
    CommunicationChannel Channel,
    string SubjectTemplate,
    string BodyTemplate,
    Guid? CampusId = null);

public record RenderTemplateRequest(
    Guid TemplateId,
    Dictionary<string, string> Placeholders);

public record RenderedTemplateDto(
    string Subject,
    string Body);

// --- Announcement ---
public record AnnouncementRecipientDto(
    Guid Id,
    Guid AnnouncementId,
    RecipientType RecipientType,
    Guid? UserId,
    string? RecipientName,
    string? Email,
    string? PhoneNumber,
    DeliveryStatus Status,
    DateTime? ReadAtUtc);

public record AnnouncementDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string Title,
    string Content,
    AnnouncementPriority Priority,
    TargetAudienceType TargetAudience,
    Guid? ProgramId,
    string? ProgramName,
    Guid? SectionId,
    string? SectionName,
    Guid PublishedByUserId,
    string? PublishedByName,
    DateTime PublishDateUtc,
    DateTime? ExpiryDateUtc,
    bool IsPublished,
    int TotalRecipients,
    int ReadCount,
    DateTime CreatedAtUtc);

public record AnnouncementDetailDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string Title,
    string Content,
    AnnouncementPriority Priority,
    TargetAudienceType TargetAudience,
    Guid? ProgramId,
    string? ProgramName,
    Guid? SectionId,
    string? SectionName,
    Guid PublishedByUserId,
    string? PublishedByName,
    DateTime PublishDateUtc,
    DateTime? ExpiryDateUtc,
    bool IsPublished,
    bool SendEmail,
    bool SendSms,
    IReadOnlyList<AnnouncementRecipientDto> Recipients);

public record CreateAnnouncementRequest(
    string Title,
    string Content,
    AnnouncementPriority Priority,
    TargetAudienceType TargetAudience,
    Guid? ProgramId = null,
    Guid? SectionId = null,
    DateTime? ExpiryDateUtc = null,
    bool SendEmail = false,
    bool SendSms = false,
    Guid? CampusId = null);

// --- Notification ---
public record NotificationDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    Guid UserId,
    string Title,
    string Message,
    string? ActionUrl,
    string? Category,
    bool IsRead,
    DateTime? ReadAtUtc,
    DateTime CreatedAtUtc);

public record CreateNotificationRequest(
    Guid UserId,
    string Title,
    string Message,
    string? ActionUrl = null,
    string? Category = null,
    Guid? CampusId = null);

// --- Direct Message ---
public record DirectMessageDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    Guid SenderUserId,
    string SenderName,
    Guid RecipientUserId,
    string RecipientName,
    string Subject,
    string Content,
    bool IsRead,
    DateTime? ReadAtUtc,
    DateTime SentAtUtc);

public record SendDirectMessageRequest(
    Guid RecipientUserId,
    string Subject,
    string Content,
    Guid? CampusId = null);
