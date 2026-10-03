using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolERP.Domain.Entities.Organization;

namespace SchoolERP.Infrastructure.Persistence.Configurations;

public class OrganizationConfiguration : IEntityTypeConfiguration<Organization>
{
    public void Configure(EntityTypeBuilder<Organization> builder)
    {
        builder.ToTable("Organizations");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(o => o.NormalizedCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(o => o.NormalizedCode)
            .IsUnique();

        builder.Property(o => o.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(o => o.Email)
            .HasMaxLength(256);

        builder.Property(o => o.Phone)
            .HasMaxLength(50);

        builder.Property(o => o.Currency)
            .HasMaxLength(10);

        builder.Property(o => o.TimeZone)
            .HasMaxLength(100);

        builder.HasOne(o => o.ParentOrganization)
            .WithMany(o => o.SubOrganizations)
            .HasForeignKey(o => o.ParentOrganizationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(o => o.Campuses)
            .WithOne(c => c.Organization)
            .HasForeignKey(c => c.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(o => o.OrganizationUsers)
            .WithOne(ou => ou.Organization)
            .HasForeignKey(ou => ou.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class CampusConfiguration : IEntityTypeConfiguration<Campus>
{
    public void Configure(EntityTypeBuilder<Campus> builder)
    {
        builder.ToTable("Campuses");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.NormalizedCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(c => new { c.OrganizationId, c.NormalizedCode })
            .IsUnique();

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.Phone)
            .HasMaxLength(50);

        builder.Property(c => c.Email)
            .HasMaxLength(256);

        builder.HasMany(c => c.OrganizationUsers)
            .WithOne(ou => ou.Campus)
            .HasForeignKey(ou => ou.CampusId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class OrganizationUserConfiguration : IEntityTypeConfiguration<OrganizationUser>
{
    public void Configure(EntityTypeBuilder<OrganizationUser> builder)
    {
        builder.ToTable("OrganizationUsers");

        builder.HasKey(ou => new { ou.OrganizationId, ou.UserId });

        builder.Property(ou => ou.AssignedBy)
            .HasMaxLength(100);
    }
}
