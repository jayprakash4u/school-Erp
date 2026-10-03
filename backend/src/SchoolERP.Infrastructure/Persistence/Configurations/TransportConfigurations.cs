using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolERP.Domain.Entities.Transport;

namespace SchoolERP.Infrastructure.Persistence.Configurations;

public class DriverConfiguration : IEntityTypeConfiguration<Driver>
{
    public void Configure(EntityTypeBuilder<Driver> builder)
    {
        builder.ToTable("Drivers");
        builder.HasKey(d => d.Id);

        builder.Property(d => d.FullName).IsRequired().HasMaxLength(150);
        builder.Property(d => d.LicenseNumber).IsRequired().HasMaxLength(50);
        builder.Property(d => d.ContactNumber).IsRequired().HasMaxLength(50);
        builder.Property(d => d.EmergencyContact).HasMaxLength(50);

        builder.HasIndex(d => new { d.OrganizationId, d.LicenseNumber }).IsUnique();

        builder.HasOne(d => d.Staff)
            .WithMany()
            .HasForeignKey(d => d.StaffId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class VehicleConfiguration : IEntityTypeConfiguration<Vehicle>
{
    public void Configure(EntityTypeBuilder<Vehicle> builder)
    {
        builder.ToTable("Vehicles");
        builder.HasKey(v => v.Id);

        builder.Property(v => v.RegistrationNumber).IsRequired().HasMaxLength(50);
        builder.Property(v => v.Model).IsRequired().HasMaxLength(100);
        builder.Property(v => v.GPSDeviceNumber).HasMaxLength(100);

        builder.HasIndex(v => new { v.OrganizationId, v.RegistrationNumber }).IsUnique();

        builder.HasOne(v => v.AssignedDriver)
            .WithMany(d => d.Vehicles)
            .HasForeignKey(v => v.AssignedDriverId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class RouteConfiguration : IEntityTypeConfiguration<Route>
{
    public void Configure(EntityTypeBuilder<Route> builder)
    {
        builder.ToTable("Routes");
        builder.HasKey(r => r.Id);

        builder.Property(r => r.Code).IsRequired().HasMaxLength(50);
        builder.Property(r => r.Name).IsRequired().HasMaxLength(150);
        builder.Property(r => r.StartLocation).IsRequired().HasMaxLength(200);
        builder.Property(r => r.EndLocation).IsRequired().HasMaxLength(200);

        builder.HasIndex(r => new { r.OrganizationId, r.Code }).IsUnique();

        builder.HasOne(r => r.Vehicle)
            .WithMany(v => v.Routes)
            .HasForeignKey(r => r.VehicleId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(r => r.Stops)
            .WithOne(s => s.Route)
            .HasForeignKey(s => s.RouteId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class RouteStopConfiguration : IEntityTypeConfiguration<RouteStop>
{
    public void Configure(EntityTypeBuilder<RouteStop> builder)
    {
        builder.ToTable("RouteStops");
        builder.HasKey(s => s.Id);

        builder.Property(s => s.StopName).IsRequired().HasMaxLength(150);
        builder.Property(s => s.DistanceKm).HasPrecision(18, 2);
        builder.Property(s => s.MonthlyFeeAmount).HasPrecision(18, 2);

        builder.HasIndex(s => new { s.RouteId, s.StopOrder });
    }
}

public class TransportAssignmentConfiguration : IEntityTypeConfiguration<TransportAssignment>
{
    public void Configure(EntityTypeBuilder<TransportAssignment> builder)
    {
        builder.ToTable("TransportAssignments");
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

        builder.HasOne(a => a.Route)
            .WithMany(r => r.TransportAssignments)
            .HasForeignKey(a => a.RouteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.RouteStop)
            .WithMany(s => s.TransportAssignments)
            .HasForeignKey(a => a.RouteStopId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Vehicle)
            .WithMany(v => v.PassengerAssignments)
            .HasForeignKey(a => a.VehicleId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(a => a.TransportFees)
            .WithOne(f => f.TransportAssignment)
            .HasForeignKey(f => f.TransportAssignmentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class TransportFeeConfiguration : IEntityTypeConfiguration<TransportFee>
{
    public void Configure(EntityTypeBuilder<TransportFee> builder)
    {
        builder.ToTable("TransportFees");
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
