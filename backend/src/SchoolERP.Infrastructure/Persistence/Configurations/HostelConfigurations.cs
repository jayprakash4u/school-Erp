using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolERP.Domain.Entities.Hostel;

namespace SchoolERP.Infrastructure.Persistence.Configurations;

public class HostelConfiguration : IEntityTypeConfiguration<Hostel>
{
    public void Configure(EntityTypeBuilder<Hostel> builder)
    {
        builder.ToTable("Hostels");
        builder.HasKey(h => h.Id);

        builder.Property(h => h.Code).IsRequired().HasMaxLength(50);
        builder.Property(h => h.Name).IsRequired().HasMaxLength(150);
        builder.Property(h => h.Address).IsRequired().HasMaxLength(250);
        builder.Property(h => h.WardenContactNumber).HasMaxLength(50);

        builder.HasIndex(h => new { h.OrganizationId, h.Code }).IsUnique();

        builder.HasOne(h => h.WardenStaff)
            .WithMany()
            .HasForeignKey(h => h.WardenStaffId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(h => h.Buildings)
            .WithOne(b => b.Hostel)
            .HasForeignKey(b => b.HostelId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class BuildingConfiguration : IEntityTypeConfiguration<Building>
{
    public void Configure(EntityTypeBuilder<Building> builder)
    {
        builder.ToTable("HostelBuildings");
        builder.HasKey(b => b.Id);

        builder.Property(b => b.Code).IsRequired().HasMaxLength(50);
        builder.Property(b => b.Name).IsRequired().HasMaxLength(150);

        builder.HasIndex(b => new { b.HostelId, b.Code }).IsUnique();

        builder.HasMany(b => b.Floors)
            .WithOne(f => f.Building)
            .HasForeignKey(f => f.BuildingId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class FloorConfiguration : IEntityTypeConfiguration<Floor>
{
    public void Configure(EntityTypeBuilder<Floor> builder)
    {
        builder.ToTable("HostelFloors");
        builder.HasKey(f => f.Id);

        builder.Property(f => f.FloorName).IsRequired().HasMaxLength(100);

        builder.HasIndex(f => new { f.BuildingId, f.FloorNumber });

        builder.HasMany(f => f.Rooms)
            .WithOne(r => r.Floor)
            .HasForeignKey(r => r.FloorId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class RoomConfiguration : IEntityTypeConfiguration<Room>
{
    public void Configure(EntityTypeBuilder<Room> builder)
    {
        builder.ToTable("HostelRooms");
        builder.HasKey(r => r.Id);

        builder.Property(r => r.RoomNumber).IsRequired().HasMaxLength(50);
        builder.Property(r => r.MonthlyFeeAmount).HasPrecision(18, 2);

        builder.HasIndex(r => new { r.FloorId, r.RoomNumber }).IsUnique();

        builder.HasMany(r => r.Beds)
            .WithOne(b => b.Room)
            .HasForeignKey(b => b.RoomId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class BedConfiguration : IEntityTypeConfiguration<Bed>
{
    public void Configure(EntityTypeBuilder<Bed> builder)
    {
        builder.ToTable("HostelBeds");
        builder.HasKey(b => b.Id);

        builder.Property(b => b.BedNumber).IsRequired().HasMaxLength(50);

        builder.HasIndex(b => new { b.RoomId, b.BedNumber }).IsUnique();
    }
}

public class HostelAllocationConfiguration : IEntityTypeConfiguration<HostelAllocation>
{
    public void Configure(EntityTypeBuilder<HostelAllocation> builder)
    {
        builder.ToTable("HostelAllocations");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.MonthlyFee).HasPrecision(18, 2);
        builder.Property(a => a.Remarks).HasMaxLength(250);

        builder.HasIndex(a => new { a.OrganizationId, a.StudentId, a.AcademicYearId });

        builder.HasOne(a => a.Student)
            .WithMany()
            .HasForeignKey(a => a.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.AcademicYear)
            .WithMany()
            .HasForeignKey(a => a.AcademicYearId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Hostel)
            .WithMany()
            .HasForeignKey(a => a.HostelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Building)
            .WithMany()
            .HasForeignKey(a => a.BuildingId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Floor)
            .WithMany()
            .HasForeignKey(a => a.FloorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Room)
            .WithMany()
            .HasForeignKey(a => a.RoomId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Bed)
            .WithMany(b => b.Allocations)
            .HasForeignKey(a => a.BedId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(a => a.HostelFees)
            .WithOne(f => f.HostelAllocation)
            .HasForeignKey(f => f.HostelAllocationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class HostelFeeConfiguration : IEntityTypeConfiguration<HostelFee>
{
    public void Configure(EntityTypeBuilder<HostelFee> builder)
    {
        builder.ToTable("HostelFees");
        builder.HasKey(f => f.Id);

        builder.Property(f => f.Amount).HasPrecision(18, 2);
        builder.Property(f => f.DiscountAmount).HasPrecision(18, 2);
        builder.Property(f => f.Notes).HasMaxLength(250);

        builder.HasIndex(f => new { f.OrganizationId, f.StudentId, f.AcademicYearId, f.Month, f.Year });

        builder.HasOne(f => f.Student)
            .WithMany()
            .HasForeignKey(f => f.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(f => f.AcademicYear)
            .WithMany()
            .HasForeignKey(f => f.AcademicYearId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class HostelAttendanceConfiguration : IEntityTypeConfiguration<HostelAttendance>
{
    public void Configure(EntityTypeBuilder<HostelAttendance> builder)
    {
        builder.ToTable("HostelAttendances");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Remarks).HasMaxLength(250);

        builder.HasIndex(a => new { a.HostelId, a.StudentId, a.Date }).IsUnique();

        builder.HasOne(a => a.Hostel)
            .WithMany()
            .HasForeignKey(a => a.HostelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Student)
            .WithMany()
            .HasForeignKey(a => a.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Bed)
            .WithMany()
            .HasForeignKey(a => a.BedId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
