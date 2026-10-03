using SchoolERP.Application.Attendance;
using SchoolERP.Contracts.Academics;
using SchoolERP.Contracts.Attendance;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Students;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Attendance;

public class TakeAttendanceCommandHandlerTests
{
    [Fact]
    public async Task TakeAttendance_DailySectionAttendance_ShouldRecordEntriesAndCalculateSummary()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-ORG", "Sample School Org");
        context.Organizations.Add(org);

        var level = new AcademicLevel(org.Id, "SEC", "Secondary School", AcademicLevelCategory.Secondary);
        context.AcademicLevels.Add(level);

        var grade10 = new Domain.Entities.Academics.Program(org.Id, level.Id, "G10", "Grade 10", 1, 1);
        context.Programs.Add(grade10);

        var year = new AcademicYear(org.Id, "2026-27", "2026-2027", new DateOnly(2026, 4, 1), new DateOnly(2027, 3, 31));
        context.AcademicYears.Add(year);

        var sectionA = new Section(org.Id, grade10.Id, year.Id, "10A", "Section A", 40);
        context.Sections.Add(sectionA);

        var ram = new Student(org.Id, "RAM-001", "Ram", "Sharma", Gender.Male, new DateOnly(2010, 5, 1));
        var hari = new Student(org.Id, "HARI-002", "Hari", "Prasad", Gender.Male, new DateOnly(2010, 6, 1));
        var sita = new Student(org.Id, "SITA-003", "Sita", "Patel", Gender.Female, new DateOnly(2010, 7, 1));
        context.Students.AddRange(ram, hari, sita);
        await context.SaveChangesAsync();

        var handler = new TakeAttendanceCommandHandler(context);
        var attendanceDate = new DateOnly(2026, 10, 1);

        var command = new TakeAttendanceCommand(
            org.Id,
            year.Id,
            grade10.Id,
            sectionA.Id,
            attendanceDate,
            new List<StudentAttendanceEntry>
            {
                new(ram.Id, AttendanceStatus.Present),
                new(hari.Id, AttendanceStatus.Present),
                new(sita.Id, AttendanceStatus.Absent, null, "Sick leave")
            });

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(attendanceDate, result.Value.Date);
        Assert.Equal(3, result.Value.TotalStudents);
        Assert.Equal(2, result.Value.PresentCount);
        Assert.Equal(1, result.Value.AbsentCount);

        // Check Individual Summary
        var summaryQuery = new GetStudentAttendanceSummaryQueryHandler(context);
        
        var ramSummary = await summaryQuery.Handle(new GetStudentAttendanceSummaryQuery(ram.Id), CancellationToken.None);
        Assert.True(ramSummary.IsSuccess);
        Assert.Equal(1, ramSummary.Value.TotalWorkingDays);
        Assert.Equal(1, ramSummary.Value.PresentDays);
        Assert.Equal(100.0m, ramSummary.Value.AttendancePercentage);

        var sitaSummary = await summaryQuery.Handle(new GetStudentAttendanceSummaryQuery(sita.Id), CancellationToken.None);
        Assert.True(sitaSummary.IsSuccess);
        Assert.Equal(1, sitaSummary.Value.TotalWorkingDays);
        Assert.Equal(1, sitaSummary.Value.AbsentDays);
        Assert.Equal(0.0m, sitaSummary.Value.AttendancePercentage);
    }
}
