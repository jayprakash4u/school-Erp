using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolERP.Domain.Entities.Attendance;

namespace SchoolERP.Infrastructure.Persistence.Configurations;

public class AttendanceSessionConfiguration : IEntityTypeConfiguration<AttendanceSession>
{
    public void Configure(EntityTypeBuilder<AttendanceSession> builder)
    {
        builder.ToTable("AttendanceSessions");
        builder.HasKey(s => s.Id);

        builder.HasIndex(s => new { s.OrganizationId, s.AcademicYearId, s.ProgramId, s.SectionId, s.Date, s.Type });

        builder.HasOne(s => s.AcademicYear)
            .WithMany()
            .HasForeignKey(s => s.AcademicYearId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Program)
            .WithMany()
            .HasForeignKey(s => s.ProgramId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Section)
            .WithMany()
            .HasForeignKey(s => s.SectionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Subject)
            .WithMany()
            .HasForeignKey(s => s.SubjectId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.TakenByStaff)
            .WithMany()
            .HasForeignKey(s => s.TakenByStaffId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(s => s.Records)
            .WithOne(r => r.AttendanceSession)
            .HasForeignKey(r => r.AttendanceSessionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class AttendanceRecordConfiguration : IEntityTypeConfiguration<AttendanceRecord>
{
    public void Configure(EntityTypeBuilder<AttendanceRecord> builder)
    {
        builder.ToTable("AttendanceRecords");
        builder.HasKey(r => r.Id);

        builder.HasIndex(r => new { r.AttendanceSessionId, r.StudentId }).IsUnique();

        builder.Property(r => r.Remarks).HasMaxLength(250);

        builder.HasOne(r => r.Student)
            .WithMany()
            .HasForeignKey(r => r.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Enrollment)
            .WithMany()
            .HasForeignKey(r => r.EnrollmentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(r => r.Corrections)
            .WithOne(c => c.AttendanceRecord)
            .HasForeignKey(c => c.AttendanceRecordId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class AttendanceCorrectionConfiguration : IEntityTypeConfiguration<AttendanceCorrection>
{
    public void Configure(EntityTypeBuilder<AttendanceCorrection> builder)
    {
        builder.ToTable("AttendanceCorrections");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Reason).IsRequired().HasMaxLength(300);
        builder.Property(c => c.ReviewRemarks).HasMaxLength(300);
        builder.Property(c => c.RequestedByUserId).HasMaxLength(100);
        builder.Property(c => c.ReviewedByUserId).HasMaxLength(100);
    }
}

public class AttendanceSummaryConfiguration : IEntityTypeConfiguration<AttendanceSummary>
{
    public void Configure(EntityTypeBuilder<AttendanceSummary> builder)
    {
        builder.ToTable("AttendanceSummaries");
        builder.HasKey(s => s.Id);

        builder.HasIndex(s => new { s.OrganizationId, s.StudentId, s.AcademicYearId, s.ProgramId, s.SectionId }).IsUnique();

        builder.HasOne(s => s.Student)
            .WithMany()
            .HasForeignKey(s => s.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.AcademicYear)
            .WithMany()
            .HasForeignKey(s => s.AcademicYearId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Program)
            .WithMany()
            .HasForeignKey(s => s.ProgramId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Section)
            .WithMany()
            .HasForeignKey(s => s.SectionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
