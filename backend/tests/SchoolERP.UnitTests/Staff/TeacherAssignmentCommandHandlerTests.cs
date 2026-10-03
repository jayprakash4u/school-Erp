using SchoolERP.Application.Staff.TeacherAssignments;
using SchoolERP.Contracts.Academics;
using SchoolERP.Contracts.Staff;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Staff;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Staff;

public class TeacherAssignmentCommandHandlerTests
{
    [Fact]
    public async Task AssignTeacher_ToSubjectSectionAndYear_ShouldCreateValidAssignment()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-ORG", "Sample School Org");
        context.Organizations.Add(org);

        var level = new AcademicLevel(org.Id, "SEC", "Secondary School", AcademicLevelCategory.Secondary);
        context.AcademicLevels.Add(level);

        var program = new Domain.Entities.Academics.Program(org.Id, level.Id, "G10", "Grade 10", 1, 1);
        context.Programs.Add(program);

        var year = new AcademicYear(org.Id, "2026-27", "2026-2027", new DateOnly(2026, 4, 1), new DateOnly(2027, 3, 31));
        context.AcademicYears.Add(year);

        var section = new Section(org.Id, program.Id, year.Id, "10A", "Section A", 40);
        context.Sections.Add(section);

        var subject = new Subject(org.Id, "MATH-10", "Mathematics 10", SubjectType.Theory, 4.0m);
        context.Subjects.Add(subject);

        var teacher = new SchoolERP.Domain.Entities.Staff.Staff(
            org.Id,
            "T-2026-005",
            "Rajesh",
            "Verma",
            Gender.Male,
            new DateOnly(1982, 3, 14),
            "rajesh.verma@school.edu",
            StaffType.Teaching,
            new DateOnly(2018, 6, 1));
        context.Staff.Add(teacher);
        await context.SaveChangesAsync();

        var handler = new CreateTeacherAssignmentCommandHandler(context);
        var command = new CreateTeacherAssignmentCommand(
            teacher.Id,
            subject.Id,
            program.Id,
            year.Id,
            section.Id,
            null,
            true,
            new DateOnly(2026, 4, 1),
            "Lead Mathematics Teacher for Grade 10 Section A");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(teacher.Id, result.Value.StaffId);
        Assert.Equal("Rajesh Verma", result.Value.TeacherName);
        Assert.Equal("MATH-10", result.Value.SubjectCode);
        Assert.Equal("Grade 10", result.Value.ProgramName);
        Assert.Equal("Section A", result.Value.SectionName);
        Assert.Equal("2026-2027", result.Value.AcademicYearName);
        Assert.True(result.Value.IsPrimaryTeacher);
        Assert.True(result.Value.IsActive);

        // Verify Querying by Teacher
        var queryHandler = new GetTeacherAssignmentsQueryHandler(context);
        var queryResult = await queryHandler.Handle(new GetTeacherAssignmentsQuery(teacher.Id), CancellationToken.None);

        Assert.True(queryResult.IsSuccess);
        Assert.Single(queryResult.Value);
        Assert.Equal("Section A", queryResult.Value[0].SectionName);
    }
}
