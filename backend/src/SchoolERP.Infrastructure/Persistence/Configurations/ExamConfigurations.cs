using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolERP.Domain.Entities.Examinations;

namespace SchoolERP.Infrastructure.Persistence.Configurations;

public class ExamTypeConfiguration : IEntityTypeConfiguration<ExamType>
{
    public void Configure(EntityTypeBuilder<ExamType> builder)
    {
        builder.ToTable("ExamTypes");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Code).IsRequired().HasMaxLength(50);
        builder.Property(e => e.Name).IsRequired().HasMaxLength(100);
        builder.Property(e => e.Description).HasMaxLength(250);

        builder.HasIndex(e => new { e.OrganizationId, e.Code }).IsUnique();
    }
}

public class GradingScaleConfiguration : IEntityTypeConfiguration<GradingScale>
{
    public void Configure(EntityTypeBuilder<GradingScale> builder)
    {
        builder.ToTable("GradingScales");
        builder.HasKey(g => g.Id);

        builder.Property(g => g.Name).IsRequired().HasMaxLength(100);
        builder.Property(g => g.Description).HasMaxLength(250);

        builder.HasMany(g => g.Rules)
            .WithOne(r => r.GradingScale)
            .HasForeignKey(r => r.GradingScaleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class GradeRuleConfiguration : IEntityTypeConfiguration<GradeRule>
{
    public void Configure(EntityTypeBuilder<GradeRule> builder)
    {
        builder.ToTable("GradeRules");
        builder.HasKey(r => r.Id);

        builder.Property(r => r.GradeLetter).IsRequired().HasMaxLength(10);
        builder.Property(r => r.MinPercentage).HasPrecision(5, 2);
        builder.Property(r => r.MaxPercentage).HasPrecision(5, 2);
        builder.Property(r => r.GradePoint).HasPrecision(4, 2);
        builder.Property(r => r.Description).HasMaxLength(150);
    }
}

public class ExamConfiguration : IEntityTypeConfiguration<Exam>
{
    public void Configure(EntityTypeBuilder<Exam> builder)
    {
        builder.ToTable("Exams");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Code).IsRequired().HasMaxLength(50);
        builder.Property(e => e.Name).IsRequired().HasMaxLength(150);

        builder.HasIndex(e => new { e.OrganizationId, e.AcademicYearId, e.Code }).IsUnique();

        builder.HasOne(e => e.AcademicYear)
            .WithMany()
            .HasForeignKey(e => e.AcademicYearId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.AcademicPeriod)
            .WithMany()
            .HasForeignKey(e => e.AcademicPeriodId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.ExamType)
            .WithMany()
            .HasForeignKey(e => e.ExamTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.GradingScale)
            .WithMany()
            .HasForeignKey(e => e.GradingScaleId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(e => e.ExamSubjects)
            .WithOne(s => s.Exam)
            .HasForeignKey(s => s.ExamId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Results)
            .WithOne(r => r.Exam)
            .HasForeignKey(r => r.ExamId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ExamSubjectConfiguration : IEntityTypeConfiguration<ExamSubject>
{
    public void Configure(EntityTypeBuilder<ExamSubject> builder)
    {
        builder.ToTable("ExamSubjects");
        builder.HasKey(s => s.Id);

        builder.Property(s => s.MaxTheoryMarks).HasPrecision(6, 2);
        builder.Property(s => s.MaxPracticalMarks).HasPrecision(6, 2);
        builder.Property(s => s.PassingMarks).HasPrecision(6, 2);

        builder.HasIndex(s => new { s.ExamId, s.SubjectId, s.ProgramId }).IsUnique();

        builder.HasOne(s => s.Subject)
            .WithMany()
            .HasForeignKey(s => s.SubjectId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Program)
            .WithMany()
            .HasForeignKey(s => s.ProgramId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(s => s.MarksEntries)
            .WithOne(m => m.ExamSubject)
            .HasForeignKey(m => m.ExamSubjectId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class MarksEntryConfiguration : IEntityTypeConfiguration<MarksEntry>
{
    public void Configure(EntityTypeBuilder<MarksEntry> builder)
    {
        builder.ToTable("MarksEntries");
        builder.HasKey(m => m.Id);

        builder.Property(m => m.TheoryMarksObtained).HasPrecision(6, 2);
        builder.Property(m => m.PracticalMarksObtained).HasPrecision(6, 2);
        builder.Property(m => m.GradePoint).HasPrecision(4, 2);
        builder.Property(m => m.GradeLetter).HasMaxLength(10);
        builder.Property(m => m.Remarks).HasMaxLength(250);

        builder.HasIndex(m => new { m.ExamSubjectId, m.StudentId }).IsUnique();

        builder.HasOne(m => m.Student)
            .WithMany()
            .HasForeignKey(m => m.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.Enrollment)
            .WithMany()
            .HasForeignKey(m => m.EnrollmentId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class ExamResultConfiguration : IEntityTypeConfiguration<ExamResult>
{
    public void Configure(EntityTypeBuilder<ExamResult> builder)
    {
        builder.ToTable("ExamResults");
        builder.HasKey(r => r.Id);

        builder.Property(r => r.TotalMaxMarks).HasPrecision(8, 2);
        builder.Property(r => r.TotalMarksObtained).HasPrecision(8, 2);
        builder.Property(r => r.GPA).HasPrecision(4, 2);
        builder.Property(r => r.OverallGrade).HasMaxLength(10);

        builder.HasIndex(r => new { r.ExamId, r.StudentId }).IsUnique();
        builder.HasIndex(r => new { r.OrganizationId, r.ExamId, r.ProgramId });

        builder.HasOne(r => r.Student)
            .WithMany()
            .HasForeignKey(r => r.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.AcademicYear)
            .WithMany()
            .HasForeignKey(r => r.AcademicYearId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Program)
            .WithMany()
            .HasForeignKey(r => r.ProgramId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Section)
            .WithMany()
            .HasForeignKey(r => r.SectionId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class ReportCardConfiguration : IEntityTypeConfiguration<ReportCard>
{
    public void Configure(EntityTypeBuilder<ReportCard> builder)
    {
        builder.ToTable("ReportCards");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.ReportCardNumber).IsRequired().HasMaxLength(50);
        builder.Property(c => c.TotalMaxMarks).HasPrecision(8, 2);
        builder.Property(c => c.TotalMarksObtained).HasPrecision(8, 2);
        builder.Property(c => c.Percentage).HasPrecision(5, 2);
        builder.Property(c => c.GPA).HasPrecision(4, 2);
        builder.Property(c => c.OverallGrade).HasMaxLength(10);
        builder.Property(c => c.OverallAttendancePercentage).HasPrecision(5, 2);
        builder.Property(c => c.ClassTeacherRemarks).HasMaxLength(500);
        builder.Property(c => c.PrincipalRemarks).HasMaxLength(500);

        builder.HasIndex(c => new { c.OrganizationId, c.ReportCardNumber }).IsUnique();
        builder.HasIndex(c => new { c.ExamId, c.StudentId }).IsUnique();

        builder.HasOne(c => c.Student)
            .WithMany()
            .HasForeignKey(c => c.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Exam)
            .WithMany()
            .HasForeignKey(c => c.ExamId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.AcademicYear)
            .WithMany()
            .HasForeignKey(c => c.AcademicYearId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
