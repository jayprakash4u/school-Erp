using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolERP.Domain.Entities.Identity;

namespace SchoolERP.Infrastructure.Persistence.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("RefreshTokens");

        builder.HasKey(rt => rt.Id);

        builder.Property(rt => rt.Token)
            .IsRequired()
            .HasMaxLength(256);

        builder.HasIndex(rt => rt.Token)
            .IsUnique();

        builder.Property(rt => rt.CreatedByIp)
            .HasMaxLength(100);

        builder.Property(rt => rt.RevokedByIp)
            .HasMaxLength(100);

        builder.Property(rt => rt.ReplacedByToken)
            .HasMaxLength(256);

        builder.Property(rt => rt.ReasonRevoked)
            .HasMaxLength(256);
    }
}

public class LoginSessionConfiguration : IEntityTypeConfiguration<LoginSession>
{
    public void Configure(EntityTypeBuilder<LoginSession> builder)
    {
        builder.ToTable("LoginSessions");

        builder.HasKey(ls => ls.Id);

        builder.Property(ls => ls.IpAddress)
            .HasMaxLength(100);

        builder.Property(ls => ls.UserAgent)
            .HasMaxLength(500);

        builder.Property(ls => ls.Device)
            .HasMaxLength(100);
    }
}

public class PasswordResetTokenConfiguration : IEntityTypeConfiguration<PasswordResetToken>
{
    public void Configure(EntityTypeBuilder<PasswordResetToken> builder)
    {
        builder.ToTable("PasswordResetTokens");

        builder.HasKey(prt => prt.Id);

        builder.Property(prt => prt.TokenHash)
            .IsRequired()
            .HasMaxLength(256);

        builder.HasIndex(prt => prt.TokenHash);
    }
}

public class SecurityEventConfiguration : IEntityTypeConfiguration<SecurityEvent>
{
    public void Configure(EntityTypeBuilder<SecurityEvent> builder)
    {
        builder.ToTable("SecurityEvents");

        builder.HasKey(se => se.Id);

        builder.Property(se => se.EventType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(se => se.Description)
            .HasMaxLength(1000);

        builder.Property(se => se.IpAddress)
            .HasMaxLength(100);

        builder.Property(se => se.UserAgent)
            .HasMaxLength(500);

        builder.Property(se => se.AdditionalData)
            .HasMaxLength(4000);
    }
}
