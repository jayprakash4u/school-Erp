using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolERP.Domain.Entities.Academics;
using StreamEntity = SchoolERP.Domain.Entities.Academics.Stream;

namespace SchoolERP.Infrastructure.Persistence.Configurations;

public class AcademicYearConfiguration : IEntityTypeConfiguration<AcademicYear>
{
    public void Configure(EntityTypeBuilder<AcademicYear> builder)
    {
        builder.ToTable("AcademicYears");
        builder.HasKey(y => y.Id);

        builder.Property(y => y.Code).IsRequired().HasMaxLength(50);
        builder.Property(y => y.Name).IsRequired().HasMaxLength(100);

        builder.HasIndex(y => new { y.OrganizationId, y.Code }).IsUnique();

        builder.HasMany(y => y.Periods)
            .WithOne(p => p.AcademicYear)
            .HasForeignKey(p => p.AcademicYearId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(y => y.Batches)
            .WithOne(b => b.AcademicYear)
            .HasForeignKey(b => b.AcademicYearId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(y => y.Sections)
            .WithOne(s => s.AcademicYear)
            .HasForeignKey(s => s.AcademicYearId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class AcademicPeriodConfiguration : IEntityTypeConfiguration<AcademicPeriod>
{
    public void Configure(EntityTypeBuilder<AcademicPeriod> builder)
    {
        builder.ToTable("AcademicPeriods");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Code).IsRequired().HasMaxLength(50);
        builder.Property(p => p.Name).IsRequired().HasMaxLength(100);
    }
}

public class AcademicLevelConfiguration : IEntityTypeConfiguration<AcademicLevel>
{
    public void Configure(EntityTypeBuilder<AcademicLevel> builder)
    {
        builder.ToTable("AcademicLevels");
        builder.HasKey(l => l.Id);

        builder.Property(l => l.Code).IsRequired().HasMaxLength(50);
        builder.Property(l => l.Name).IsRequired().HasMaxLength(100);

        builder.HasIndex(l => new { l.OrganizationId, l.Code }).IsUnique();

        builder.HasMany(l => l.Programs)
            .WithOne(p => p.AcademicLevel)
            .HasForeignKey(p => p.AcademicLevelId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class ProgramConfiguration : IEntityTypeConfiguration<Domain.Entities.Academics.Program>
{
    public void Configure(EntityTypeBuilder<Domain.Entities.Academics.Program> builder)
    {
        builder.ToTable("Programs");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Code).IsRequired().HasMaxLength(50);
        builder.Property(p => p.Name).IsRequired().HasMaxLength(200);

        builder.HasIndex(p => new { p.OrganizationId, p.Code }).IsUnique();

        builder.HasMany(p => p.Streams)
            .WithOne(s => s.Program)
            .HasForeignKey(s => s.ProgramId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Batches)
            .WithOne(b => b.Program)
            .HasForeignKey(b => b.ProgramId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(p => p.Sections)
            .WithOne(s => s.Program)
            .HasForeignKey(s => s.ProgramId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(p => p.SubjectGroups)
            .WithOne(sg => sg.Program)
            .HasForeignKey(sg => sg.ProgramId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class StreamConfiguration : IEntityTypeConfiguration<StreamEntity>
{
    public void Configure(EntityTypeBuilder<StreamEntity> builder)
    {
        builder.ToTable("Streams");
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Code).IsRequired().HasMaxLength(50);
        builder.Property(s => s.Name).IsRequired().HasMaxLength(150);
    }
}

public class BatchConfiguration : IEntityTypeConfiguration<Batch>
{
    public void Configure(EntityTypeBuilder<Batch> builder)
    {
        builder.ToTable("Batches");
        builder.HasKey(b => b.Id);

        builder.Property(b => b.Code).IsRequired().HasMaxLength(50);
        builder.Property(b => b.Name).IsRequired().HasMaxLength(150);

        builder.HasMany(b => b.Sections)
            .WithOne(s => s.Batch)
            .HasForeignKey(s => s.BatchId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class SectionConfiguration : IEntityTypeConfiguration<Section>
{
    public void Configure(EntityTypeBuilder<Section> builder)
    {
        builder.ToTable("Sections");
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Code).IsRequired().HasMaxLength(50);
        builder.Property(s => s.Name).IsRequired().HasMaxLength(100);
        builder.Property(s => s.RoomNumber).HasMaxLength(50);
    }
}

public class SubjectConfiguration : IEntityTypeConfiguration<Subject>
{
    public void Configure(EntityTypeBuilder<Subject> builder)
    {
        builder.ToTable("Subjects");
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Code).IsRequired().HasMaxLength(50);
        builder.Property(s => s.Name).IsRequired().HasMaxLength(200);
        builder.Property(s => s.Credits).HasPrecision(5, 2);

        builder.HasIndex(s => new { s.OrganizationId, s.Code }).IsUnique();
    }
}

public class SubjectGroupConfiguration : IEntityTypeConfiguration<SubjectGroup>
{
    public void Configure(EntityTypeBuilder<SubjectGroup> builder)
    {
        builder.ToTable("SubjectGroups");
        builder.HasKey(sg => sg.Id);

        builder.Property(sg => sg.Name).IsRequired().HasMaxLength(150);

        builder.HasMany(sg => sg.GroupItems)
            .WithOne(gi => gi.SubjectGroup)
            .HasForeignKey(gi => gi.SubjectGroupId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class SubjectGroupItemConfiguration : IEntityTypeConfiguration<SubjectGroupItem>
{
    public void Configure(EntityTypeBuilder<SubjectGroupItem> builder)
    {
        builder.ToTable("SubjectGroupItems");
        builder.HasKey(gi => new { gi.SubjectGroupId, gi.SubjectId });

        builder.HasOne(gi => gi.Subject)
            .WithMany(s => s.SubjectGroupItems)
            .HasForeignKey(gi => gi.SubjectId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class CurriculumConfiguration : IEntityTypeConfiguration<Curriculum>
{
    public void Configure(EntityTypeBuilder<Curriculum> builder)
    {
        builder.ToTable("Curriculums");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Code).IsRequired().HasMaxLength(50);
        builder.Property(c => c.Name).IsRequired().HasMaxLength(200);
        builder.Property(c => c.BoardOrAffiliation).IsRequired().HasMaxLength(100);

        builder.HasIndex(c => new { c.OrganizationId, c.Code }).IsUnique();

        builder.HasMany(c => c.CurriculumSubjects)
            .WithOne(cs => cs.Curriculum)
            .HasForeignKey(cs => cs.CurriculumId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class CurriculumSubjectConfiguration : IEntityTypeConfiguration<CurriculumSubject>
{
    public void Configure(EntityTypeBuilder<CurriculumSubject> builder)
    {
        builder.ToTable("CurriculumSubjects");
        builder.HasKey(cs => cs.Id);

        builder.Property(cs => cs.Credits).HasPrecision(5, 2);

        builder.HasOne(cs => cs.Subject)
            .WithMany(s => s.CurriculumSubjects)
            .HasForeignKey(cs => cs.SubjectId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
