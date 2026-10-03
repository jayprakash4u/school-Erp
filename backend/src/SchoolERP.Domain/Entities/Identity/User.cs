using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Identity;

public class User : AuditableEntity<Guid>
{
    public string Email { get; set; } = string.Empty;
    public string NormalizedEmail { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}".Trim();
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public bool EmailConfirmed { get; set; } = false;
    public string? TenantId { get; set; }
    public DateTime? LastLoginAtUtc { get; set; }
    public int AccessFailedCount { get; set; } = 0;
    public DateTime? LockoutEndUtc { get; set; }
    public bool IsLockedOut => LockoutEndUtc.HasValue && LockoutEndUtc.Value > DateTime.UtcNow;

    // Navigation Collections
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<LoginSession> LoginSessions { get; set; } = new List<LoginSession>();
    public ICollection<PasswordResetToken> PasswordResetTokens { get; set; } = new List<PasswordResetToken>();
    public ICollection<SecurityEvent> SecurityEvents { get; set; } = new List<SecurityEvent>();

    public User()
    {
        Id = Guid.NewGuid();
    }

    public User(string email, string firstName, string lastName, string? tenantId = null)
    {
        Id = Guid.NewGuid();
        Email = email;
        NormalizedEmail = email.ToUpperInvariant();
        FirstName = firstName;
        LastName = lastName;
        TenantId = tenantId;
        IsActive = true;
    }

    public void RecordLoginSuccess(DateTime nowUtc)
    {
        LastLoginAtUtc = nowUtc;
        AccessFailedCount = 0;
        LockoutEndUtc = null;
    }

    public void RecordLoginFailure(DateTime nowUtc, int maxFailedAttempts = 5, int lockoutMinutes = 15)
    {
        AccessFailedCount++;
        if (AccessFailedCount >= maxFailedAttempts)
        {
            LockoutEndUtc = nowUtc.AddMinutes(lockoutMinutes);
        }
    }

    public void Unlock()
    {
        AccessFailedCount = 0;
        LockoutEndUtc = null;
    }
}
