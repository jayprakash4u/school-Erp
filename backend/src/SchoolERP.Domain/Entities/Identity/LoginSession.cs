using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Identity;

public class LoginSession : Entity<Guid>
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? Device { get; set; }
    public DateTime LoginAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? LogoutAtUtc { get; set; }
    public bool IsActive { get; set; } = true;

    public LoginSession()
    {
        Id = Guid.NewGuid();
    }

    public void EndSession(DateTime nowUtc)
    {
        LogoutAtUtc = nowUtc;
        IsActive = false;
    }
}
