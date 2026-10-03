using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Identity;

public class SecurityEvent : Entity<Guid>
{
    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public string EventType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? AdditionalData { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public SecurityEvent()
    {
        Id = Guid.NewGuid();
    }

    public SecurityEvent(
        string eventType, 
        Guid? userId = null, 
        string? description = null, 
        string? ipAddress = null, 
        string? userAgent = null, 
        string? additionalData = null)
    {
        Id = Guid.NewGuid();
        EventType = eventType;
        UserId = userId;
        Description = description;
        IpAddress = ipAddress;
        UserAgent = userAgent;
        AdditionalData = additionalData;
        CreatedAtUtc = DateTime.UtcNow;
    }
}
