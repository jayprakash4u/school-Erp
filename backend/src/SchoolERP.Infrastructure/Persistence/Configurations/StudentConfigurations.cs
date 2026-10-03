using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolERP.Domain.Entities.Students;

namespace SchoolERP.Infrastructure.Persistence.Configurations;

public class StudentConfiguration : IEntityTypeConfiguration<Student>
{
    public void Configure(EntityTypeBuilder<Student> builder)
    {
        builder.ToTable("Students");
        builder.HasKey(s => s.Id);

        builder.Property(s => s.AdmissionNumber).IsRequired().HasMaxLength(50);
        builder.Property(s => s.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(s => s.MiddleName).HasMaxLength(100);
        builder.Property(s => s.LastName).IsRequired().HasMaxLength(100);
        builder.Property(s => s.Email).HasMaxLength(256);
        builder.Property(s => s.PhoneNumber).HasMaxLength(50);
        builder.Property(s => s.EmergencyContactNumber).HasMaxLength(50);
        builder.Property(s => s.BloodGroup).HasMaxLength(10);
        builder.Property(s => s.Nationality).HasMaxLength(100);
        builder.Property(s => s.Religion).HasMaxLength(100);
        builder.Property(s => s.Category).HasMaxLength(50);
        builder.Property(s => s.AadharOrNationalId).HasMaxLength(50);
        builder.Property(s => s.AvatarUrl).HasMaxLength(500);

        builder.HasIndex(s => new { s.OrganizationId, s.AdmissionNumber }).IsUnique();

        builder.HasMany(s => s.Addresses)
            .WithOne(a => a.Student)
            .HasForeignKey(a => a.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.StudentGuardians)
            .WithOne(sg => sg.Student)
            .HasForeignKey(sg => sg.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Documents)
            .WithOne(d => d.Student)
            .HasForeignKey(d => d.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Enrollments)
            .WithOne(e => e.Student)
            .HasForeignKey(e => e.StudentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class GuardianConfiguration : IEntityTypeConfiguration<Guardian>
{
    public void Configure(EntityTypeBuilder<Guardian> builder)
    {
        builder.ToTable("Guardians");
        builder.HasKey(g => g.Id);

        builder.Property(g => g.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(g => g.LastName).IsRequired().HasMaxLength(100);
        builder.Property(g => g.PhoneNumber).HasMaxLength(50);
        builder.Property(g => g.Email).HasMaxLength(256);
        builder.Property(g => g.Occupation).HasMaxLength(100);
        builder.Property(g => g.AnnualIncome).HasMaxLength(50);

        builder.HasMany(g => g.StudentGuardians)
            .WithOne(sg => sg.Guardian)
            .HasForeignKey(sg => sg.GuardianId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class StudentGuardianConfiguration : IEntityTypeConfiguration<StudentGuardian>
{
    public void Configure(EntityTypeBuilder<StudentGuardian> builder)
    {
        builder.ToTable("StudentGuardians");
        builder.HasKey(sg => new { sg.StudentId, sg.GuardianId });
    }
}

public class StudentAddressConfiguration : IEntityTypeConfiguration<StudentAddress>
{
    public void Configure(EntityTypeBuilder<StudentAddress> builder)
    {
        builder.ToTable("StudentAddresses");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.AddressLine1).IsRequired().HasMaxLength(200);
        builder.Property(a => a.AddressLine2).HasMaxLength(200);
        builder.Property(a => a.City).IsRequired().HasMaxLength(100);
        builder.Property(a => a.State).IsRequired().HasMaxLength(100);
        builder.Property(a => a.Country).IsRequired().HasMaxLength(100);
        builder.Property(a => a.PostalCode).IsRequired().HasMaxLength(20);
    }
}

public class StudentDocumentConfiguration : IEntityTypeConfiguration<StudentDocument>
{
    public void Configure(EntityTypeBuilder<StudentDocument> builder)
    {
        builder.ToTable("StudentDocuments");
        builder.HasKey(d => d.Id);

        builder.Property(d => d.DocumentType).IsRequired().HasMaxLength(100);
        builder.Property(d => d.Title).IsRequired().HasMaxLength(200);
        builder.Property(d => d.DocumentUrl).IsRequired().HasMaxLength(500);
        builder.Property(d => d.FileExtension).HasMaxLength(20);
        builder.Property(d => d.VerifiedBy).HasMaxLength(100);
    }
}

public class AdmissionConfiguration : IEntityTypeConfiguration<Admission>
{
    public void Configure(EntityTypeBuilder<Admission> builder)
    {
        builder.ToTable("Admissions");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.ApplicationNumber).IsRequired().HasMaxLength(50);
        builder.Property(a => a.AdmissionNumber).HasMaxLength(50);
        builder.Property(a => a.CandidateFirstName).IsRequired().HasMaxLength(100);
        builder.Property(a => a.CandidateLastName).IsRequired().HasMaxLength(100);
        builder.Property(a => a.CandidateEmail).HasMaxLength(256);
        builder.Property(a => a.CandidatePhone).HasMaxLength(50);
        builder.Property(a => a.GuardianName).HasMaxLength(150);
        builder.Property(a => a.GuardianPhone).HasMaxLength(50);
        builder.Property(a => a.GuardianEmail).HasMaxLength(256);

        builder.HasIndex(a => new { a.OrganizationId, a.ApplicationNumber }).IsUnique();

        builder.HasOne(a => a.AcademicYear)
            .WithMany()
            .HasForeignKey(a => a.AcademicYearId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Program)
            .WithMany()
            .HasForeignKey(a => a.ProgramId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Stream)
            .WithMany()
            .HasForeignKey(a => a.StreamId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.CreatedStudent)
            .WithMany()
            .HasForeignKey(a => a.CreatedStudentId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class EnrollmentConfiguration : IEntityTypeConfiguration<Enrollment>
{
    public void Configure(EntityTypeBuilder<Enrollment> builder)
    {
        builder.ToTable("Enrollments");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.RollNumber).HasMaxLength(50);

        builder.HasIndex(e => new { e.StudentId, e.AcademicYearId, e.ProgramId });

        builder.HasOne(e => e.AcademicYear)
            .WithMany()
            .HasForeignKey(e => e.AcademicYearId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Program)
            .WithMany()
            .HasForeignKey(e => e.ProgramId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Stream)
            .WithMany()
            .HasForeignKey(e => e.StreamId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Batch)
            .WithMany()
            .HasForeignKey(e => e.BatchId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Section)
            .WithMany()
            .HasForeignKey(e => e.SectionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.AcademicPeriod)
            .WithMany()
            .HasForeignKey(e => e.AcademicPeriodId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
