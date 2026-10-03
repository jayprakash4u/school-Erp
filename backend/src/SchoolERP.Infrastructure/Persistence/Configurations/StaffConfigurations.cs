using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolERP.Domain.Entities.Staff;

namespace SchoolERP.Infrastructure.Persistence.Configurations;

public class DepartmentConfiguration : IEntityTypeConfiguration<Department>
{
    public void Configure(EntityTypeBuilder<Department> builder)
    {
        builder.ToTable("Departments");
        builder.HasKey(d => d.Id);

        builder.Property(d => d.Code).IsRequired().HasMaxLength(50);
        builder.Property(d => d.Name).IsRequired().HasMaxLength(150);

        builder.HasIndex(d => new { d.OrganizationId, d.Code }).IsUnique();

        builder.HasOne(d => d.HeadOfDepartment)
            .WithMany()
            .HasForeignKey(d => d.HeadOfDepartmentStaffId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(d => d.StaffMembers)
            .WithOne(s => s.Department)
            .HasForeignKey(s => s.DepartmentId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class DesignationConfiguration : IEntityTypeConfiguration<Designation>
{
    public void Configure(EntityTypeBuilder<Designation> builder)
    {
        builder.ToTable("Designations");
        builder.HasKey(d => d.Id);

        builder.Property(d => d.Code).IsRequired().HasMaxLength(50);
        builder.Property(d => d.Title).IsRequired().HasMaxLength(150);

        builder.HasIndex(d => new { d.OrganizationId, d.Code }).IsUnique();

        builder.HasMany(d => d.StaffMembers)
            .WithOne(s => s.Designation)
            .HasForeignKey(s => s.DesignationId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class StaffConfiguration : IEntityTypeConfiguration<Staff>
{
    public void Configure(EntityTypeBuilder<Staff> builder)
    {
        builder.ToTable("Staff");
        builder.HasKey(s => s.Id);

        builder.Property(s => s.EmployeeCode).IsRequired().HasMaxLength(50);
        builder.Property(s => s.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(s => s.MiddleName).HasMaxLength(100);
        builder.Property(s => s.LastName).IsRequired().HasMaxLength(100);
        builder.Property(s => s.Email).IsRequired().HasMaxLength(256);
        builder.Property(s => s.PhoneNumber).HasMaxLength(50);
        builder.Property(s => s.EmergencyContactNumber).HasMaxLength(50);
        builder.Property(s => s.BloodGroup).HasMaxLength(10);
        builder.Property(s => s.HighestQualification).HasMaxLength(150);
        builder.Property(s => s.AvatarUrl).HasMaxLength(500);

        builder.HasIndex(s => new { s.OrganizationId, s.EmployeeCode }).IsUnique();

        builder.HasOne(s => s.User)
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(s => s.TeacherProfile)
            .WithOne(tp => tp.Staff)
            .HasForeignKey<TeacherProfile>(tp => tp.StaffId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.TeacherAssignments)
            .WithOne(ta => ta.Staff)
            .HasForeignKey(ta => ta.StaffId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Documents)
            .WithOne(d => d.Staff)
            .HasForeignKey(d => d.StaffId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class TeacherProfileConfiguration : IEntityTypeConfiguration<TeacherProfile>
{
    public void Configure(EntityTypeBuilder<TeacherProfile> builder)
    {
        builder.ToTable("TeacherProfiles");
        builder.HasKey(tp => tp.Id);

        builder.Property(tp => tp.Specialization).HasMaxLength(200);
    }
}

public class TeacherAssignmentConfiguration : IEntityTypeConfiguration<TeacherAssignment>
{
    public void Configure(EntityTypeBuilder<TeacherAssignment> builder)
    {
        builder.ToTable("TeacherAssignments");
        builder.HasKey(ta => ta.Id);

        builder.HasIndex(ta => new { ta.StaffId, ta.SubjectId, ta.ProgramId, ta.AcademicYearId });

        builder.HasOne(ta => ta.Subject)
            .WithMany()
            .HasForeignKey(ta => ta.SubjectId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ta => ta.Program)
            .WithMany()
            .HasForeignKey(ta => ta.ProgramId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ta => ta.Section)
            .WithMany()
            .HasForeignKey(ta => ta.SectionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ta => ta.AcademicYear)
            .WithMany()
            .HasForeignKey(ta => ta.AcademicYearId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ta => ta.AcademicPeriod)
            .WithMany()
            .HasForeignKey(ta => ta.AcademicPeriodId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class StaffDocumentConfiguration : IEntityTypeConfiguration<StaffDocument>
{
    public void Configure(EntityTypeBuilder<StaffDocument> builder)
    {
        builder.ToTable("StaffDocuments");
        builder.HasKey(d => d.Id);

        builder.Property(d => d.DocumentType).IsRequired().HasMaxLength(100);
        builder.Property(d => d.Title).IsRequired().HasMaxLength(200);
        builder.Property(d => d.DocumentUrl).IsRequired().HasMaxLength(500);
        builder.Property(d => d.FileExtension).HasMaxLength(20);
        builder.Property(d => d.VerifiedBy).HasMaxLength(100);
    }
}
