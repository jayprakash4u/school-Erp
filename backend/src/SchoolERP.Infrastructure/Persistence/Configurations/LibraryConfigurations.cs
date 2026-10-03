using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolERP.Domain.Entities.Library;

namespace SchoolERP.Infrastructure.Persistence.Configurations;

public class AuthorConfiguration : IEntityTypeConfiguration<Author>
{
    public void Configure(EntityTypeBuilder<Author> builder)
    {
        builder.ToTable("Authors");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Name).IsRequired().HasMaxLength(150);
        builder.Property(a => a.Biography).HasMaxLength(1000);
    }
}

public class PublisherConfiguration : IEntityTypeConfiguration<Publisher>
{
    public void Configure(EntityTypeBuilder<Publisher> builder)
    {
        builder.ToTable("Publishers");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name).IsRequired().HasMaxLength(150);
        builder.Property(p => p.Address).HasMaxLength(250);
        builder.Property(p => p.ContactEmail).HasMaxLength(100);
    }
}

public class BookCategoryConfiguration : IEntityTypeConfiguration<BookCategory>
{
    public void Configure(EntityTypeBuilder<BookCategory> builder)
    {
        builder.ToTable("BookCategories");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Code).IsRequired().HasMaxLength(50);
        builder.Property(c => c.Name).IsRequired().HasMaxLength(100);
        builder.Property(c => c.Description).HasMaxLength(250);

        builder.HasIndex(c => new { c.OrganizationId, c.Code }).IsUnique();
    }
}

public class BookConfiguration : IEntityTypeConfiguration<Book>
{
    public void Configure(EntityTypeBuilder<Book> builder)
    {
        builder.ToTable("Books");
        builder.HasKey(b => b.Id);

        builder.Property(b => b.ISBN).IsRequired().HasMaxLength(50);
        builder.Property(b => b.Title).IsRequired().HasMaxLength(200);
        builder.Property(b => b.Subtitle).HasMaxLength(200);
        builder.Property(b => b.Edition).HasMaxLength(50);
        builder.Property(b => b.Language).HasMaxLength(50);
        builder.Property(b => b.RackNumber).HasMaxLength(50);
        builder.Property(b => b.ShelfNumber).HasMaxLength(50);

        builder.HasIndex(b => new { b.OrganizationId, b.ISBN });

        builder.HasOne(b => b.Author)
            .WithMany(a => a.Books)
            .HasForeignKey(b => b.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(b => b.Publisher)
            .WithMany(p => p.Books)
            .HasForeignKey(b => b.PublisherId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(b => b.Category)
            .WithMany(c => c.Books)
            .HasForeignKey(b => b.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(b => b.Copies)
            .WithOne(c => c.Book)
            .HasForeignKey(c => c.BookId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class BookCopyConfiguration : IEntityTypeConfiguration<BookCopy>
{
    public void Configure(EntityTypeBuilder<BookCopy> builder)
    {
        builder.ToTable("BookCopies");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.AccessionNumber).IsRequired().HasMaxLength(50);
        builder.Property(c => c.Barcode).HasMaxLength(50);
        builder.Property(c => c.ShelfLocation).HasMaxLength(100);
        builder.Property(c => c.Price).HasPrecision(18, 2);

        builder.HasIndex(c => c.AccessionNumber).IsUnique();
    }
}

public class LibraryMemberConfiguration : IEntityTypeConfiguration<LibraryMember>
{
    public void Configure(EntityTypeBuilder<LibraryMember> builder)
    {
        builder.ToTable("LibraryMembers");
        builder.HasKey(m => m.Id);

        builder.Property(m => m.MembershipNumber).IsRequired().HasMaxLength(50);
        builder.Property(m => m.FinePerDay).HasPrecision(18, 2);

        builder.HasIndex(m => new { m.OrganizationId, m.MembershipNumber }).IsUnique();

        builder.HasOne(m => m.Student)
            .WithMany()
            .HasForeignKey(m => m.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.Staff)
            .WithMany()
            .HasForeignKey(m => m.StaffId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class BookIssueConfiguration : IEntityTypeConfiguration<BookIssue>
{
    public void Configure(EntityTypeBuilder<BookIssue> builder)
    {
        builder.ToTable("BookIssues");
        builder.HasKey(i => i.Id);

        builder.Property(i => i.IssueNumber).IsRequired().HasMaxLength(50);
        builder.Property(i => i.Remarks).HasMaxLength(250);

        builder.HasIndex(i => new { i.OrganizationId, i.IssueNumber }).IsUnique();

        builder.HasOne(i => i.LibraryMember)
            .WithMany(m => m.Issues)
            .HasForeignKey(i => i.LibraryMemberId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.BookCopy)
            .WithMany(c => c.Issues)
            .HasForeignKey(i => i.BookCopyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.BookReturn)
            .WithOne(r => r.BookIssue)
            .HasForeignKey<BookReturn>(r => r.BookIssueId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(i => i.Fine)
            .WithOne(f => f.BookIssue)
            .HasForeignKey<LibraryFine>(f => f.BookIssueId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class BookReturnConfiguration : IEntityTypeConfiguration<BookReturn>
{
    public void Configure(EntityTypeBuilder<BookReturn> builder)
    {
        builder.ToTable("BookReturns");
        builder.HasKey(r => r.Id);

        builder.Property(r => r.ReturnNumber).IsRequired().HasMaxLength(50);
        builder.Property(r => r.FineAmount).HasPrecision(18, 2);
        builder.Property(r => r.Remarks).HasMaxLength(250);

        builder.HasIndex(r => new { r.OrganizationId, r.ReturnNumber }).IsUnique();
    }
}

public class LibraryFineConfiguration : IEntityTypeConfiguration<LibraryFine>
{
    public void Configure(EntityTypeBuilder<LibraryFine> builder)
    {
        builder.ToTable("LibraryFines");
        builder.HasKey(f => f.Id);

        builder.Property(f => f.FineNumber).IsRequired().HasMaxLength(50);
        builder.Property(f => f.Amount).HasPrecision(18, 2);
        builder.Property(f => f.PaidAmount).HasPrecision(18, 2);
        builder.Property(f => f.PaymentReference).HasMaxLength(100);
        builder.Property(f => f.WaivedReason).HasMaxLength(250);

        builder.HasIndex(f => new { f.OrganizationId, f.FineNumber }).IsUnique();

        builder.HasOne(f => f.LibraryMember)
            .WithMany(m => m.Fines)
            .HasForeignKey(f => f.LibraryMemberId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
