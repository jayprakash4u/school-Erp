using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolERP.Domain.Entities.Communication;

namespace SchoolERP.Infrastructure.Persistence.Configurations;

public class CommunicationTemplateConfiguration : IEntityTypeConfiguration<CommunicationTemplate>
{
    public void Configure(EntityTypeBuilder<CommunicationTemplate> builder)
    {
        builder.ToTable("CommunicationTemplates");
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Code).IsRequired().HasMaxLength(50);
        builder.Property(t => t.Name).IsRequired().HasMaxLength(150);
        builder.Property(t => t.SubjectTemplate).IsRequired().HasMaxLength(250);
        builder.Property(t => t.BodyTemplate).IsRequired().HasMaxLength(4000);

        builder.HasIndex(t => new { t.OrganizationId, t.Code }).IsUnique();
    }
}

public class AnnouncementConfiguration : IEntityTypeConfiguration<Announcement>
{
    public void Configure(EntityTypeBuilder<Announcement> builder)
    {
        builder.ToTable("Announcements");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Title).IsRequired().HasMaxLength(200);
        builder.Property(a => a.Content).IsRequired().HasMaxLength(4000);

        builder.HasOne(a => a.PublishedByUser)
            .WithMany()
            .HasForeignKey(a => a.PublishedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Program)
            .WithMany()
            .HasForeignKey(a => a.ProgramId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(a => a.Section)
            .WithMany()
            .HasForeignKey(a => a.SectionId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(a => a.Recipients)
            .WithOne(r => r.Announcement)
            .HasForeignKey(r => r.AnnouncementId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class AnnouncementRecipientConfiguration : IEntityTypeConfiguration<AnnouncementRecipient>
{
    public void Configure(EntityTypeBuilder<AnnouncementRecipient> builder)
    {
        builder.ToTable("AnnouncementRecipients");
        builder.HasKey(r => r.Id);

        builder.Property(r => r.RecipientName).HasMaxLength(150);
        builder.Property(r => r.Email).HasMaxLength(100);
        builder.Property(r => r.PhoneNumber).HasMaxLength(50);

        builder.HasIndex(r => new { r.AnnouncementId, r.Status });

        builder.HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(r => r.Student)
            .WithMany()
            .HasForeignKey(r => r.StudentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(r => r.Guardian)
            .WithMany()
            .HasForeignKey(r => r.GuardianId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(r => r.Staff)
            .WithMany()
            .HasForeignKey(r => r.StaffId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");
        builder.HasKey(n => n.Id);

        builder.Property(n => n.Title).IsRequired().HasMaxLength(200);
        builder.Property(n => n.Message).IsRequired().HasMaxLength(1000);
        builder.Property(n => n.ActionUrl).HasMaxLength(250);
        builder.Property(n => n.Category).HasMaxLength(50);

        builder.HasIndex(n => new { n.UserId, n.IsRead });

        builder.HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class DirectMessageConfiguration : IEntityTypeConfiguration<DirectMessage>
{
    public void Configure(EntityTypeBuilder<DirectMessage> builder)
    {
        builder.ToTable("DirectMessages");
        builder.HasKey(m => m.Id);

        builder.Property(m => m.Subject).IsRequired().HasMaxLength(200);
        builder.Property(m => m.Content).IsRequired().HasMaxLength(4000);

        builder.HasIndex(m => new { m.RecipientUserId, m.IsRead });

        builder.HasOne(m => m.SenderUser)
            .WithMany()
            .HasForeignKey(m => m.SenderUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.RecipientUser)
            .WithMany()
            .HasForeignKey(m => m.RecipientUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
