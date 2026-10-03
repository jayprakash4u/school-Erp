using SchoolERP.Application.Students.Enrollments;
using SchoolERP.Contracts.Academics;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Students;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Students;

public class EnrollmentCommandHandlerTests
{
    [Fact]
    public async Task StudentProgression_AcrossAcademicYears_ShouldMaintainFullHistoricalEnrollments()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-ORG", "Sample School Org");
        context.Organizations.Add(org);

        var levelMiddle = new AcademicLevel(org.Id, "MID", "Middle School", AcademicLevelCategory.Middle);
        var levelSec = new AcademicLevel(org.Id, "SEC", "Secondary School", AcademicLevelCategory.Secondary);
        context.AcademicLevels.AddRange(levelMiddle, levelSec);

        var grade8 = new Domain.Entities.Academics.Program(org.Id, levelMiddle.Id, "G8", "Grade 8", 1, 1);
        var grade9 = new Domain.Entities.Academics.Program(org.Id, levelSec.Id, "G9", "Grade 9", 1, 1);
        var grade10 = new Domain.Entities.Academics.Program(org.Id, levelSec.Id, "G10", "Grade 10", 1, 1);
        context.Programs.AddRange(grade8, grade9, grade10);

        var year2024 = new AcademicYear(org.Id, "2024-25", "2024-2025", new DateOnly(2024, 4, 1), new DateOnly(2025, 3, 31));
        var year2025 = new AcademicYear(org.Id, "2025-26", "2025-2026", new DateOnly(2025, 4, 1), new DateOnly(2026, 3, 31));
        var year2026 = new AcademicYear(org.Id, "2026-27", "2026-2027", new DateOnly(2026, 4, 1), new DateOnly(2027, 3, 31));
        context.AcademicYears.AddRange(year2024, year2025, year2026);

        var sec8A = new Section(org.Id, grade8.Id, year2024.Id, "8A", "Section A", 40);
        var sec9B = new Section(org.Id, grade9.Id, year2025.Id, "9B", "Section B", 40);
        var sec10A = new Section(org.Id, grade10.Id, year2026.Id, "10A", "Section A", 40);
        context.Sections.AddRange(sec8A, sec9B, sec10A);

        var student = new Student(org.Id, "RAM-001", "Ram", "Sharma", Gender.Male, new DateOnly(2012, 1, 1));
        context.Students.Add(student);
        await context.SaveChangesAsync();

        var enrollHandler = new CreateEnrollmentCommandHandler(context);
        var promoteHandler = new PromoteStudentCommandHandler(context);

        // Step 1: Initial Enrollment in 2024-25 -> Grade 8 -> Section A
        var enrollCommand = new CreateEnrollmentCommand(
            student.Id,
            year2024.Id,
            grade8.Id,
            sec8A.Id,
            null,
            null,
            null,
            "0801",
            new DateOnly(2024, 4, 1));
        var res1 = await enrollHandler.Handle(enrollCommand, CancellationToken.None);
        Assert.True(res1.IsSuccess);

        // Step 2: Promote in 2025-26 -> Grade 9 -> Section B
        var promoteTo9 = new PromoteStudentCommand(
            student.Id,
            new PromoteStudentRequest(
                year2025.Id,
                grade9.Id,
                sec9B.Id,
                null,
                null,
                null,
                "0905",
                EnrollmentStatus.Promoted,
                "Promoted to Grade 9"));
        var res2 = await promoteHandler.Handle(promoteTo9, CancellationToken.None);
        Assert.True(res2.IsSuccess);

        // Step 3: Promote in 2026-27 -> Grade 10 -> Section A
        var promoteTo10 = new PromoteStudentCommand(
            student.Id,
            new PromoteStudentRequest(
                year2026.Id,
                grade10.Id,
                sec10A.Id,
                null,
                null,
                null,
                "1002",
                EnrollmentStatus.Promoted,
                "Promoted to Grade 10"));
        var res3 = await promoteHandler.Handle(promoteTo10, CancellationToken.None);
        Assert.True(res3.IsSuccess);

        // Query Historical Progression
        var historyQuery = new GetStudentEnrollmentsQueryHandler(context);
        var historyResult = await historyQuery.Handle(new GetStudentEnrollmentsQuery(student.Id), CancellationToken.None);

        // Assert
        Assert.True(historyResult.IsSuccess);
        Assert.Equal(3, historyResult.Value.Count);

        var currentEnrollment = historyResult.Value.First(e => e.Status == EnrollmentStatus.Active);
        Assert.Equal("Grade 10", currentEnrollment.ProgramName);
        Assert.Equal("2026-2027", currentEnrollment.AcademicYearName);
        Assert.Equal("Section A", currentEnrollment.SectionName);
        Assert.Equal("1002", currentEnrollment.RollNumber);

        var pastEnrollments = historyResult.Value.Where(e => e.Status == EnrollmentStatus.Promoted).ToList();
        Assert.Equal(2, pastEnrollments.Count);
        Assert.Contains(pastEnrollments, e => e.ProgramName == "Grade 8" && e.SectionName == "Section A");
        Assert.Contains(pastEnrollments, e => e.ProgramName == "Grade 9" && e.SectionName == "Section B");
    }
}
