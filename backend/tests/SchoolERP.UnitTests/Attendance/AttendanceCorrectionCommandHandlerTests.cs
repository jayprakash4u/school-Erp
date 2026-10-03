using SchoolERP.Application.Attendance;
using SchoolERP.Contracts.Academics;
using SchoolERP.Contracts.Attendance;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Attendance;
using SchoolERP.Domain.Entities.Students;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Attendance;

public class AttendanceCorrectionCommandHandlerTests
{
    [Fact]
    public async Task RequestAndApproveCorrection_ShouldUpdateRecordStatusToPresent()
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

        var sita = new Student(org.Id, "SITA-003", "Sita", "Patel", Gender.Female, new DateOnly(2010, 7, 1));
        context.Students.Add(sita);

        var session = new AttendanceSession(org.Id, year.Id, grade10.Id, sectionA.Id, new DateOnly(2026, 10, 1));
        context.AttendanceSessions.Add(session);

        var record = new AttendanceRecord(session.Id, sita.Id, AttendanceStatus.Absent);
        context.AttendanceRecords.Add(record);
        await context.SaveChangesAsync();

        var requestHandler = new RequestAttendanceCorrectionCommandHandler(context);
        var processHandler = new ProcessAttendanceCorrectionCommandHandler(context);

        // Act 1: Request correction from Absent to Present
        var requestCommand = new RequestAttendanceCorrectionCommand(
            record.Id,
            AttendanceStatus.Present,
            "Student was participating in inter-school science exhibition with permission",
            "teacher-id-123");

        var requestResult = await requestHandler.Handle(requestCommand, CancellationToken.None);
        Assert.True(requestResult.IsSuccess);
        Assert.Equal(CorrectionRequestStatus.Pending, requestResult.Value.Status);
        Assert.Equal(AttendanceStatus.Absent, requestResult.Value.OldStatus);
        Assert.Equal(AttendanceStatus.Present, requestResult.Value.NewStatus);

        // Act 2: Principal/Admin Approves correction
        var processCommand = new ProcessAttendanceCorrectionCommand(
            requestResult.Value.Id,
            CorrectionRequestStatus.Approved,
            "Exhibition permission letter verified",
            "principal-id-001");

        var processResult = await processHandler.Handle(processCommand, CancellationToken.None);
        Assert.True(processResult.IsSuccess);
        Assert.Equal(CorrectionRequestStatus.Approved, processResult.Value.Status);

        // Assert record status updated in DB
        var updatedRecord = await context.AttendanceRecords.FindAsync(record.Id);
        Assert.NotNull(updatedRecord);
        Assert.Equal(AttendanceStatus.Present, updatedRecord.Status);
    }
}
