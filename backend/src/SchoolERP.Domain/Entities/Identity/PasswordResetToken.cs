using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Identity;

public class PasswordResetToken : Entity<Guid>
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string TokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? UsedAtUtc { get; set; }
    public bool IsUsed => UsedAtUtc.HasValue;
    public bool IsExpired => DateTime.UtcNow >= ExpiresAtUtc;
    public bool IsValid => !IsUsed && !IsExpired;

    public PasswordResetToken()
    {
        Id = Guid.NewGuid();
    }
}
