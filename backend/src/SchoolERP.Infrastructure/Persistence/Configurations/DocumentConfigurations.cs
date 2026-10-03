using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolERP.Domain.Entities.Documents;

namespace SchoolERP.Infrastructure.Persistence.Configurations;

public class DocumentCategoryConfiguration : IEntityTypeConfiguration<DocumentCategory>
{
    public void Configure(EntityTypeBuilder<DocumentCategory> builder)
    {
        builder.ToTable("DocumentCategories");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Code).IsRequired().HasMaxLength(50);
        builder.Property(c => c.Name).IsRequired().HasMaxLength(150);
        builder.Property(c => c.Description).HasMaxLength(250);

        builder.HasIndex(c => new { c.OrganizationId, c.Code }).IsUnique();

        builder.HasMany(c => c.DocumentTypes)
            .WithOne(t => t.Category)
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class DocumentTypeConfiguration : IEntityTypeConfiguration<DocumentType>
{
    public void Configure(EntityTypeBuilder<DocumentType> builder)
    {
        builder.ToTable("DocumentTypes");
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Code).IsRequired().HasMaxLength(50);
        builder.Property(t => t.Name).IsRequired().HasMaxLength(150);
        builder.Property(t => t.AllowedExtensions).HasMaxLength(100);

        builder.HasIndex(t => new { t.OrganizationId, t.Code }).IsUnique();

        builder.HasMany(t => t.Documents)
            .WithOne(d => d.DocumentType)
            .HasForeignKey(d => d.DocumentTypeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class DocumentConfiguration : IEntityTypeConfiguration<Document>
{
    public void Configure(EntityTypeBuilder<Document> builder)
    {
        builder.ToTable("Documents");
        builder.HasKey(d => d.Id);

        builder.Property(d => d.Title).IsRequired().HasMaxLength(200);
        builder.Property(d => d.FileName).IsRequired().HasMaxLength(250);
        builder.Property(d => d.StoragePath).IsRequired().HasMaxLength(500);
        builder.Property(d => d.ContentType).IsRequired().HasMaxLength(100);
        builder.Property(d => d.FileHashSha256).HasMaxLength(100);
        builder.Property(d => d.VerificationNotes).HasMaxLength(500);

        builder.HasIndex(d => new { d.OrganizationId, d.OwnerType, d.OwnerEntityId });

        builder.HasOne(d => d.UploadedByUser)
            .WithMany()
            .HasForeignKey(d => d.UploadedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(d => d.VerifiedByUser)
            .WithMany()
            .HasForeignKey(d => d.VerifiedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(d => d.AccessGrants)
            .WithOne(a => a.Document)
            .HasForeignKey(a => a.DocumentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class DocumentAccessConfiguration : IEntityTypeConfiguration<DocumentAccess>
{
    public void Configure(EntityTypeBuilder<DocumentAccess> builder)
    {
        builder.ToTable("DocumentAccessGrants");
        builder.HasKey(a => a.Id);

        builder.HasIndex(a => new { a.DocumentId, a.GrantedToUserId });

        builder.HasOne(a => a.GrantedToUser)
            .WithMany()
            .HasForeignKey(a => a.GrantedToUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(a => a.GrantedToRole)
            .WithMany()
            .HasForeignKey(a => a.GrantedToRoleId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
