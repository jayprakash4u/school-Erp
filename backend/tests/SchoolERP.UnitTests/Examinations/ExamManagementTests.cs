using SchoolERP.Application.Examinations;
using SchoolERP.Contracts.Academics;
using SchoolERP.Contracts.Examinations;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Examinations;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Examinations;

public class ExamManagementTests
{
    [Fact]
    public async Task CreateExamType_ValidInput_ShouldSucceed()
    {
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-01", "Greenwood High");
        context.Organizations.Add(org);
        await context.SaveChangesAsync();

        var handler = new CreateExamTypeCommandHandler(context);
        var command = new CreateExamTypeCommand(org.Id, "TERM-EXAM", "Term Examination", "Semester or term based exam");

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("TERM-EXAM", result.Value.Code);
        Assert.Equal("Term Examination", result.Value.Name);
    }

    [Fact]
    public async Task CreateGradingScale_WithRules_ShouldSucceed()
    {
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-01", "Greenwood High");
        context.Organizations.Add(org);
        await context.SaveChangesAsync();

        var handler = new CreateGradingScaleCommandHandler(context);
        var command = new CreateGradingScaleCommand(
            org.Id,
            "Standard 10-Point Scale",
            "A to F grading scale",
            true,
            new List<CreateGradeRuleRequest>
            {
                new("A+", 90, 100, 4.0m, "Outstanding"),
                new("A", 80, 89.99m, 3.6m, "Excellent"),
                new("B+", 70, 79.99m, 3.2m, "Very Good"),
                new("B", 60, 69.99m, 2.8m, "Good"),
                new("C+", 50, 59.99m, 2.4m, "Satisfactory"),
                new("C", 40, 49.99m, 2.0m, "Acceptable"),
                new("F", 0, 39.99m, 0.0m, "Fail")
            });

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("Standard 10-Point Scale", result.Value.Name);
        Assert.True(result.Value.IsDefault);
        Assert.Equal(7, result.Value.Rules.Count);
    }

    [Fact]
    public async Task CreateExam_AndScheduleExamSubjects_ShouldSucceed()
    {
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-01", "Greenwood High");
        context.Organizations.Add(org);

        var year = new AcademicYear(org.Id, "2026-27", "2026-2027", new DateOnly(2026, 4, 1), new DateOnly(2027, 3, 31));
        context.AcademicYears.Add(year);

        var examType = new ExamType(org.Id, "MID-TERM", "Mid-Term Exam");
        context.ExamTypes.Add(examType);

        var level = new AcademicLevel(org.Id, "SEC", "Secondary", AcademicLevelCategory.Secondary);
        context.AcademicLevels.Add(level);

        var grade10 = new Domain.Entities.Academics.Program(org.Id, level.Id, "G10", "Grade 10", 1, 1);
        context.Programs.Add(grade10);

        var math = new Subject(org.Id, "MATH101", "Mathematics", SubjectType.Theory, 1.0m, false);
        var science = new Subject(org.Id, "SCI101", "Science", SubjectType.Composite, 1.0m, false);
        context.Subjects.AddRange(math, science);

        await context.SaveChangesAsync();

        // 1. Create Exam
        var examHandler = new CreateExamCommandHandler(context);
        var createExamCmd = new CreateExamCommand(
            org.Id,
            year.Id,
            examType.Id,
            "MID-2026",
            "Mid Term Exam 2026",
            new DateOnly(2026, 10, 10),
            new DateOnly(2026, 10, 20));

        var examResult = await examHandler.Handle(createExamCmd, CancellationToken.None);
        Assert.True(examResult.IsSuccess);
        Assert.Equal("MID-2026", examResult.Value.Code);

        // 2. Schedule Subject Paper 1 (Math)
        var scheduleHandler = new ScheduleExamSubjectCommandHandler(context);
        var mathScheduleCmd = new ScheduleExamSubjectCommand(
            examResult.Value.Id,
            math.Id,
            grade10.Id,
            new DateOnly(2026, 10, 10),
            new TimeOnly(9, 0),
            new TimeOnly(12, 0),
            MaxTheoryMarks: 80,
            MaxPracticalMarks: 20,
            PassingMarks: 33);

        var mathScheduleResult = await scheduleHandler.Handle(mathScheduleCmd, CancellationToken.None);
        Assert.True(mathScheduleResult.IsSuccess);
        Assert.Equal(100, mathScheduleResult.Value.TotalMaxMarks);

        // 3. Schedule Subject Paper 2 (Science)
        var sciScheduleCmd = new ScheduleExamSubjectCommand(
            examResult.Value.Id,
            science.Id,
            grade10.Id,
            new DateOnly(2026, 10, 12),
            new TimeOnly(9, 0),
            new TimeOnly(12, 0),
            MaxTheoryMarks: 75,
            MaxPracticalMarks: 25,
            PassingMarks: 33);

        var sciScheduleResult = await scheduleHandler.Handle(sciScheduleCmd, CancellationToken.None);
        Assert.True(sciScheduleResult.IsSuccess);

        // 4. Get Exam Details
        var detailsHandler = new GetExamByIdQueryHandler(context);
        var details = await detailsHandler.Handle(new GetExamByIdQuery(examResult.Value.Id), CancellationToken.None);

        Assert.True(details.IsSuccess);
        Assert.Equal(2, details.Value.ExamSubjects.Count);
        Assert.Equal("Mid Term Exam 2026", details.Value.Name);
    }
}
