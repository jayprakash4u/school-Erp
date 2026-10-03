using SchoolERP.Application.Transport;
using SchoolERP.Contracts.Academics;
using SchoolERP.Contracts.Students;
using SchoolERP.Contracts.Transport;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Students;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Transport;

public class TransportAssignmentAndCapacityTests
{
    [Fact]
    public async Task TransportAssignment_CapacitySafeguard_Roster_AndFees_ShouldWorkCorrectly()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-01", "Greenwood High");
        context.Organizations.Add(org);

        var ay = new AcademicYear(org.Id, "2026-2027", "2026/27", new DateOnly(2026, 4, 1), new DateOnly(2027, 3, 31), isCurrent: true);
        context.AcademicYears.Add(ay);

        var level = new AcademicLevel(org.Id, "SEC", "Secondary", AcademicLevelCategory.Secondary);
        context.AcademicLevels.Add(level);

        var program = new SchoolERP.Domain.Entities.Academics.Program(org.Id, level.Id, "G10", "Grade 10", 1, 1);
        context.Programs.Add(program);

        var secA = new Section(org.Id, program.Id, ay.Id, "10A", "Section A", 40);
        context.Sections.Add(secA);

        // Students
        var ram = new Student(org.Id, "RAM-001", "Ram", "Sharma", Gender.Male, new DateOnly(2010, 5, 1));
        ram.EmergencyContactNumber = "9841000001";

        var hari = new Student(org.Id, "HARI-002", "Hari", "KC", Gender.Male, new DateOnly(2010, 6, 1));
        hari.EmergencyContactNumber = "9841000002";

        var sita = new Student(org.Id, "SITA-003", "Sita", "Giri", Gender.Female, new DateOnly(2010, 7, 1));
        sita.EmergencyContactNumber = "9841000003";

        context.Students.AddRange(ram, hari, sita);

        // Enrollments
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        context.Enrollments.AddRange(
            new Enrollment(ram.Id, ay.Id, program.Id, today, sectionId: secA.Id, rollNumber: "10-A-01"),
            new Enrollment(hari.Id, ay.Id, program.Id, today, sectionId: secA.Id, rollNumber: "10-A-02"),
            new Enrollment(sita.Id, ay.Id, program.Id, today, sectionId: secA.Id, rollNumber: "10-A-03")
        );

        // 1. Driver
        var driver = new SchoolERP.Domain.Entities.Transport.Driver(
            org.Id, "Shyam Sundar", "DL-5555", new DateOnly(2030, 1, 1), "9851000000");
        context.Drivers.Add(driver);

        // 2. Vehicle with Small Capacity = 2 for testing capacity safeguard
        var vehicle = new SchoolERP.Domain.Entities.Transport.Vehicle(
            org.Id, "BA-2-PA-1234", VehicleType.Van, "Toyota HiAce", capacity: 2, assignedDriverId: driver.Id);
        context.Vehicles.Add(vehicle);

        // 3. Route with 2 Stops
        var route = new SchoolERP.Domain.Entities.Transport.Route(
            org.Id, "R-WEST", "West Valley Route", "Kirtipur", "School", 30, vehicleId: vehicle.Id);
        var stop1 = new SchoolERP.Domain.Entities.Transport.RouteStop(
            org.Id, route.Id, "Kirtipur Gate", 1, 1500.0m, pickupTime: new TimeOnly(7, 30), dropTime: new TimeOnly(16, 0));
        var stop2 = new SchoolERP.Domain.Entities.Transport.RouteStop(
            org.Id, route.Id, "Naya Bazar", 2, 1800.0m, pickupTime: new TimeOnly(7, 45), dropTime: new TimeOnly(15, 45));
        route.Stops.Add(stop1);
        route.Stops.Add(stop2);
        context.Routes.Add(route);

        await context.SaveChangesAsync();

        // 4. Assign Ram to Stop 1
        var assignHandler = new AssignStudentTransportCommandHandler(context);
        var ramAssignRes = await assignHandler.Handle(new AssignStudentTransportCommand(
            org.Id, ram.Id, ay.Id, route.Id, stop1.Id, TransportServiceType.TwoWay, new DateOnly(2026, 4, 1)), CancellationToken.None);

        Assert.True(ramAssignRes.IsSuccess);
        Assert.Equal("Ram Sharma", ramAssignRes.Value.StudentName);
        Assert.Equal("Grade 10", ramAssignRes.Value.ProgramName);
        Assert.Equal("R-WEST", ramAssignRes.Value.RouteCode);
        Assert.Equal("Kirtipur Gate", ramAssignRes.Value.StopName);
        Assert.Equal(1500.0m, ramAssignRes.Value.MonthlyFee);
        Assert.Equal("BA-2-PA-1234", ramAssignRes.Value.VehicleRegistrationNumber);
        Assert.Equal("Shyam Sundar", ramAssignRes.Value.DriverName);

        // 5. Test Duplicate Assignment Safeguard
        var dupAssignRes = await assignHandler.Handle(new AssignStudentTransportCommand(
            org.Id, ram.Id, ay.Id, route.Id, stop2.Id), CancellationToken.None);

        Assert.False(dupAssignRes.IsSuccess);
        Assert.Equal("TransportAssignment.AlreadyAssigned", dupAssignRes.Error.Code);

        // 6. Assign Hari to Stop 2 (reaches Vehicle Capacity = 2)
        var hariAssignRes = await assignHandler.Handle(new AssignStudentTransportCommand(
            org.Id, hari.Id, ay.Id, route.Id, stop2.Id, TransportServiceType.TwoWay, new DateOnly(2026, 4, 1)), CancellationToken.None);

        Assert.True(hariAssignRes.IsSuccess);
        Assert.Equal("Hari KC", hariAssignRes.Value.StudentName);

        // 7. Test Capacity Safeguard: Sita should fail because vehicle capacity is 2
        var sitaAssignRes = await assignHandler.Handle(new AssignStudentTransportCommand(
            org.Id, sita.Id, ay.Id, route.Id, stop1.Id), CancellationToken.None);

        Assert.False(sitaAssignRes.IsSuccess);
        Assert.Equal("Vehicle.CapacityFull", sitaAssignRes.Error.Code);

        // 8. Generate Route Passenger Roster
        var rosterHandler = new GetRoutePassengerRosterQueryHandler(context);
        var rosterRes = await rosterHandler.Handle(new GetRoutePassengerRosterQuery(route.Id), CancellationToken.None);

        Assert.True(rosterRes.IsSuccess);
        Assert.Equal("R-WEST", rosterRes.Value.RouteCode);
        Assert.Equal("BA-2-PA-1234", rosterRes.Value.VehicleRegistrationNumber);
        Assert.Equal("Shyam Sundar", rosterRes.Value.DriverName);
        Assert.Equal(2, rosterRes.Value.Passengers.Count);
        Assert.Equal("Ram Sharma", rosterRes.Value.Passengers[0].StudentName);
        Assert.Equal("Kirtipur Gate", rosterRes.Value.Passengers[0].StopName);
        Assert.Equal("Hari KC", rosterRes.Value.Passengers[1].StudentName);
        Assert.Equal("Naya Bazar", rosterRes.Value.Passengers[1].StopName);

        // 9. Generate Monthly Transport Fees
        var feeHandler = new GenerateMonthlyTransportFeeCommandHandler(context);
        var feeRes = await feeHandler.Handle(new GenerateMonthlyTransportFeeCommand(
            org.Id, ay.Id, Month: 4, Year: 2026, DueDate: new DateOnly(2026, 4, 10)), CancellationToken.None);

        Assert.True(feeRes.IsSuccess);
        Assert.Equal(2, feeRes.Value); // Generated for 2 students (Ram & Hari)

        // Generating again for same month/year should generate 0 duplicates
        var feeRes2 = await feeHandler.Handle(new GenerateMonthlyTransportFeeCommand(
            org.Id, ay.Id, Month: 4, Year: 2026, DueDate: new DateOnly(2026, 4, 10)), CancellationToken.None);

        Assert.True(feeRes2.IsSuccess);
        Assert.Equal(0, feeRes2.Value);

        // 10. Cancel Ram's Assignment
        var cancelHandler = new CancelTransportAssignmentCommandHandler(context);
        var cancelRes = await cancelHandler.Handle(new CancelTransportAssignmentCommand(
            ramAssignRes.Value.Id, "Relocated to hostel"), CancellationToken.None);

        Assert.True(cancelRes.IsSuccess);
        Assert.Equal(AssignmentStatus.Cancelled, cancelRes.Value.Status);

        // Now vehicle has 1 free seat, Sita can be assigned!
        var sitaAssignAfterCancel = await assignHandler.Handle(new AssignStudentTransportCommand(
            org.Id, sita.Id, ay.Id, route.Id, stop1.Id), CancellationToken.None);

        Assert.True(sitaAssignAfterCancel.IsSuccess);
        Assert.Equal("Sita Giri", sitaAssignAfterCancel.Value.StudentName);
    }
}
