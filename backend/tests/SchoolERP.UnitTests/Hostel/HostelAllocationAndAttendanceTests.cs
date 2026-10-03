using SchoolERP.Application.Hostel;
using SchoolERP.Contracts.Academics;
using SchoolERP.Contracts.Hostel;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Hostel;
using SchoolERP.Domain.Entities.Students;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Hostel;

public class HostelAllocationAndAttendanceTests
{
    [Fact]
    public async Task HostelAllocation_Attendance_FeeGeneration_AndVacate_ShouldWorkCorrectly()
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
        var hari = new Student(org.Id, "HARI-002", "Hari", "KC", Gender.Male, new DateOnly(2010, 6, 1));
        var sita = new Student(org.Id, "SITA-003", "Sita", "Giri", Gender.Female, new DateOnly(2010, 7, 1));
        context.Students.AddRange(ram, hari, sita);

        // Enrollments
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        context.Enrollments.AddRange(
            new Enrollment(ram.Id, ay.Id, program.Id, today, sectionId: secA.Id, rollNumber: "10-A-01"),
            new Enrollment(hari.Id, ay.Id, program.Id, today, sectionId: secA.Id, rollNumber: "10-A-02"),
            new Enrollment(sita.Id, ay.Id, program.Id, today, sectionId: secA.Id, rollNumber: "10-A-03")
        );

        // 1. Hostel Structure (Hostel -> Building -> Floor -> Room -> Beds)
        var hostel = new Domain.Entities.Hostel.Hostel(org.Id, "HST-01", "Main Boys Hostel", HostelType.Boys, "South Campus");
        var building = new Building(org.Id, hostel.Id, "B1", "Building 1", 2);
        var floor = new Floor(org.Id, building.Id, 1, "Floor 1");
        var room = new Room(org.Id, floor.Id, "101", RoomType.Double, 6000.0m, 2);
        var bed1 = new Bed(org.Id, room.Id, "101-B1");
        var bed2 = new Bed(org.Id, room.Id, "101-B2");

        room.Beds.Add(bed1);
        room.Beds.Add(bed2);
        floor.Rooms.Add(room);
        building.Floors.Add(floor);
        hostel.Buildings.Add(building);
        context.Hostels.Add(hostel);

        await context.SaveChangesAsync();

        // 2. Allocate Ram to Bed 1
        var allocHandler = new AllocateStudentHostelCommandHandler(context);
        var ramAllocRes = await allocHandler.Handle(new AllocateStudentHostelCommand(
            org.Id, ram.Id, ay.Id, bed1.Id, new DateOnly(2026, 4, 1)), CancellationToken.None);

        Assert.True(ramAllocRes.IsSuccess);
        Assert.Equal("Ram Sharma", ramAllocRes.Value.StudentName);
        Assert.Equal("Grade 10", ramAllocRes.Value.ProgramName);
        Assert.Equal("Main Boys Hostel", ramAllocRes.Value.HostelName);
        Assert.Equal("Building 1", ramAllocRes.Value.BuildingName);
        Assert.Equal("Floor 1", ramAllocRes.Value.FloorName);
        Assert.Equal("101", ramAllocRes.Value.RoomNumber);
        Assert.Equal("101-B1", ramAllocRes.Value.BedNumber);
        Assert.Equal(6000.0m, ramAllocRes.Value.MonthlyFee);
        Assert.Equal(HostelAllocationStatus.Active, ramAllocRes.Value.Status);

        // Verify Bed 1 status changed to Occupied
        var bed1Db = await context.Beds.FindAsync(bed1.Id);
        Assert.NotNull(bed1Db);
        Assert.Equal(BedStatus.Occupied, bed1Db.Status);

        // 3. Test Booking an Occupied Bed (Hari trying to book Bed 1 should fail)
        var hariFailRes = await allocHandler.Handle(new AllocateStudentHostelCommand(
            org.Id, hari.Id, ay.Id, bed1.Id), CancellationToken.None);

        Assert.False(hariFailRes.IsSuccess);
        Assert.Equal("Bed.NotAvailable", hariFailRes.Error.Code);

        // 4. Test Duplicate Allocation for Ram in the same Academic Year
        var ramDupRes = await allocHandler.Handle(new AllocateStudentHostelCommand(
            org.Id, ram.Id, ay.Id, bed2.Id), CancellationToken.None);

        Assert.False(ramDupRes.IsSuccess);
        Assert.Equal("HostelAllocation.AlreadyAllocated", ramDupRes.Error.Code);

        // 5. Allocate Hari to Bed 2
        var hariAllocRes = await allocHandler.Handle(new AllocateStudentHostelCommand(
            org.Id, hari.Id, ay.Id, bed2.Id, new DateOnly(2026, 4, 1)), CancellationToken.None);

        Assert.True(hariAllocRes.IsSuccess);
        Assert.Equal("Hari KC", hariAllocRes.Value.StudentName);

        // 6. Mark Night Roll Call Attendance for Hostel
        var attendanceHandler = new MarkHostelAttendanceCommandHandler(context);
        var attDate = new DateOnly(2026, 4, 15);
        var attItems = new List<MarkHostelAttendanceItem>
        {
            new(ram.Id, bed1.Id, HostelAttendanceStatus.Present, "Present in room"),
            new(hari.Id, bed2.Id, HostelAttendanceStatus.OnLeave, "Approved home leave")
        };

        var markRes = await attendanceHandler.Handle(new MarkHostelAttendanceCommand(
            hostel.Id, attDate, attItems), CancellationToken.None);

        Assert.True(markRes.IsSuccess);
        Assert.Equal(2, markRes.Value);

        // 7. Query Hostel Attendance Roster
        var rosterHandler = new GetHostelAttendanceRosterQueryHandler(context);
        var rosterRes = await rosterHandler.Handle(new GetHostelAttendanceRosterQuery(hostel.Id, attDate), CancellationToken.None);

        Assert.True(rosterRes.IsSuccess);
        Assert.Equal("Main Boys Hostel", rosterRes.Value.HostelName);
        Assert.Equal(2, rosterRes.Value.TotalHostellers);
        Assert.Equal(1, rosterRes.Value.PresentCount);
        Assert.Equal(1, rosterRes.Value.OnLeaveCount);
        Assert.Equal(0, rosterRes.Value.AbsentCount);

        // 8. Generate Monthly Hostel Fees for April 2026
        var feeHandler = new GenerateMonthlyHostelFeeCommandHandler(context);
        var feeRes = await feeHandler.Handle(new GenerateMonthlyHostelFeeCommand(
            org.Id, ay.Id, Month: 4, Year: 2026, DueDate: new DateOnly(2026, 4, 10)), CancellationToken.None);

        Assert.True(feeRes.IsSuccess);
        Assert.Equal(2, feeRes.Value); // 2 Hostellers (Ram & Hari)

        // Idempotency: generating again for same month/year generates 0 duplicates
        var feeRes2 = await feeHandler.Handle(new GenerateMonthlyHostelFeeCommand(
            org.Id, ay.Id, Month: 4, Year: 2026, DueDate: new DateOnly(2026, 4, 10)), CancellationToken.None);

        Assert.True(feeRes2.IsSuccess);
        Assert.Equal(0, feeRes2.Value);

        // 9. Vacate Ram's Allocation
        var vacateHandler = new VacateHostelCommandHandler(context);
        var vacateRes = await vacateHandler.Handle(new VacateHostelCommand(
            ramAllocRes.Value.Id, "Finished final term"), CancellationToken.None);

        Assert.True(vacateRes.IsSuccess);
        Assert.Equal(HostelAllocationStatus.Vacated, vacateRes.Value.Status);
        Assert.NotNull(vacateRes.Value.VacatedDate);

        // Verify Bed 1 status is released back to Available
        bed1Db = await context.Beds.FindAsync(bed1.Id);
        Assert.NotNull(bed1Db);
        Assert.Equal(BedStatus.Available, bed1Db.Status);
    }
}
