using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolERP.Domain.Entities.Settings;

namespace SchoolERP.Infrastructure.Persistence.Configurations;

public class AppSettingConfiguration : IEntityTypeConfiguration<AppSetting>
{
    public void Configure(EntityTypeBuilder<AppSetting> builder)
    {
        builder.ToTable("AppSettings");
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Key).IsRequired().HasMaxLength(150);
        builder.Property(s => s.Value).IsRequired().HasMaxLength(8000);
        builder.Property(s => s.Description).HasMaxLength(500);

        builder.HasIndex(s => new { s.OrganizationId, s.CampusId, s.Category, s.Key }).IsUnique();
    }
}

public class DocumentSequenceConfiguration : IEntityTypeConfiguration<DocumentSequence>
{
    public void Configure(EntityTypeBuilder<DocumentSequence> builder)
    {
        builder.ToTable("DocumentSequences");
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Prefix).IsRequired().HasMaxLength(50);
        builder.Property(s => s.Suffix).HasMaxLength(50);
        builder.Property(s => s.FormatPattern).HasMaxLength(100);

        builder.HasIndex(s => new { s.OrganizationId, s.CampusId, s.SequenceType }).IsUnique();
    }
}
