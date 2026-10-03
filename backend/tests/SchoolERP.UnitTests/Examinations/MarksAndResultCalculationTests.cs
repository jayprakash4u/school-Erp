using SchoolERP.Application.Examinations;
using SchoolERP.Contracts.Academics;
using SchoolERP.Contracts.Examinations;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Examinations;
using SchoolERP.Domain.Entities.Students;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Examinations;

public class MarksAndResultCalculationTests
{
    [Fact]
    public async Task CompleteExaminationWorkflow_MarksEntry_ResultCalculation_ReportCard_ShouldCalculateAccurately()
    {
        // 1. Arrange Master Setup & Students
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-01", "Greenwood High");
        context.Organizations.Add(org);

        var year = new AcademicYear(org.Id, "2026-27", "2026-2027", new DateOnly(2026, 4, 1), new DateOnly(2027, 3, 31));
        context.AcademicYears.Add(year);

        var level = new AcademicLevel(org.Id, "SEC", "Secondary", AcademicLevelCategory.Secondary);
        context.AcademicLevels.Add(level);

        var grade10 = new Domain.Entities.Academics.Program(org.Id, level.Id, "G10", "Grade 10", 1, 1);
        context.Programs.Add(grade10);

        var sectionA = new Section(org.Id, grade10.Id, year.Id, "10A", "Section A", 40);
        context.Sections.Add(sectionA);

        var math = new Subject(org.Id, "MATH101", "Mathematics", SubjectType.Theory, 1.0m, false);
        var science = new Subject(org.Id, "SCI101", "Science", SubjectType.Composite, 1.0m, false);
        context.Subjects.AddRange(math, science);

        var ram = new Student(org.Id, "RAM-001", "Ram", "Sharma", Gender.Male, new DateOnly(2010, 5, 1));
        var hari = new Student(org.Id, "HARI-002", "Hari", "Prasad", Gender.Male, new DateOnly(2010, 6, 1));
        var sita = new Student(org.Id, "SITA-003", "Sita", "Patel", Gender.Female, new DateOnly(2010, 7, 1));
        context.Students.AddRange(ram, hari, sita);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var enRam = new Enrollment(ram.Id, year.Id, grade10.Id, today, sectionId: sectionA.Id, rollNumber: "10A-01");
        var enHari = new Enrollment(hari.Id, year.Id, grade10.Id, today, sectionId: sectionA.Id, rollNumber: "10A-02");
        var enSita = new Enrollment(sita.Id, year.Id, grade10.Id, today, sectionId: sectionA.Id, rollNumber: "10A-03");
        context.Enrollments.AddRange(enRam, enHari, enSita);

        // Grading Scale
        var gradingScale = new GradingScale(org.Id, "Standard 10-Point Scale", "A+ to F", true);
        gradingScale.Rules.Add(new GradeRule(gradingScale.Id, "A+", 90, 100, 4.0m, "Outstanding"));
        gradingScale.Rules.Add(new GradeRule(gradingScale.Id, "A", 80, 89.99m, 3.6m, "Excellent"));
        gradingScale.Rules.Add(new GradeRule(gradingScale.Id, "B+", 70, 79.99m, 3.2m, "Very Good"));
        gradingScale.Rules.Add(new GradeRule(gradingScale.Id, "B", 60, 69.99m, 2.8m, "Good"));
        gradingScale.Rules.Add(new GradeRule(gradingScale.Id, "C", 33, 59.99m, 2.0m, "Pass"));
        gradingScale.Rules.Add(new GradeRule(gradingScale.Id, "F", 0, 32.99m, 0.0m, "Fail"));
        context.GradingScales.Add(gradingScale);

        // Exam Type & Exam
        var examType = new ExamType(org.Id, "ANNUAL", "Annual Final Exam");
        context.ExamTypes.Add(examType);

        var exam = new Exam(
            org.Id,
            year.Id,
            examType.Id,
            "ANNUAL-2026",
            "Annual Examination 2026",
            new DateOnly(2026, 12, 1),
            new DateOnly(2026, 12, 15),
            gradingScaleId: gradingScale.Id);
        context.Exams.Add(exam);

        // Exam Subjects (Math: Theory 80 + Practical 20 = 100; Science: Theory 75 + Practical 25 = 100)
        var examMath = new ExamSubject(exam.Id, math.Id, grade10.Id, new DateOnly(2026, 12, 1), 80, 20, 33);
        var examSci = new ExamSubject(exam.Id, science.Id, grade10.Id, new DateOnly(2026, 12, 3), 75, 25, 33);
        context.ExamSubjects.AddRange(examMath, examSci);

        await context.SaveChangesAsync();

        // 2. Record Marks for Math
        var marksHandler = new RecordExamMarksCommandHandler(context);
        var mathMarksCmd = new RecordExamMarksCommand(
            examMath.Id,
            new List<StudentMarksInput>
            {
                new(ram.Id, TheoryMarks: 75, PracticalMarks: 19),   // Ram: 94/100 -> A+
                new(hari.Id, TheoryMarks: 60, PracticalMarks: 18),  // Hari: 78/100 -> B+
                new(sita.Id, IsAbsent: true)                        // Sita: Absent -> 0
            });

        var mathMarksResult = await marksHandler.Handle(mathMarksCmd, CancellationToken.None);
        Assert.True(mathMarksResult.IsSuccess);
        Assert.Equal(3, mathMarksResult.Value.Count);
        var ramMath = mathMarksResult.Value.First(m => m.StudentId == ram.Id);
        Assert.Equal(94, ramMath.TotalMarksObtained);
        Assert.Equal("A+", ramMath.GradeLetter);
        Assert.Equal(4.0m, ramMath.GradePoint);

        // 3. Record Marks for Science
        var sciMarksCmd = new RecordExamMarksCommand(
            examSci.Id,
            new List<StudentMarksInput>
            {
                new(ram.Id, TheoryMarks: 70, PracticalMarks: 24),   // Ram: 94/100 -> A+
                new(hari.Id, TheoryMarks: 62, PracticalMarks: 20),  // Hari: 82/100 -> A
                new(sita.Id, TheoryMarks: 15, PracticalMarks: 10)   // Sita: 25/100 -> F (Below pass mark 33)
            });

        var sciMarksResult = await marksHandler.Handle(sciMarksCmd, CancellationToken.None);
        Assert.True(sciMarksResult.IsSuccess);

        // 4. Calculate Exam Results
        var calcHandler = new CalculateExamResultsCommandHandler(context);
        var calcCmd = new CalculateExamResultsCommand(exam.Id, grade10.Id, sectionA.Id);

        var resultsResult = await calcHandler.Handle(calcCmd, CancellationToken.None);
        Assert.True(resultsResult.IsSuccess);
        Assert.Equal(3, resultsResult.Value.Count);

        // Verify Ram's Result
        var ramResult = resultsResult.Value.First(r => r.StudentId == ram.Id);
        Assert.Equal(200, ramResult.TotalMaxMarks);
        Assert.Equal(188, ramResult.TotalMarksObtained); // 94 + 94
        Assert.Equal(94.0m, ramResult.Percentage);
        Assert.Equal(ResultStatus.Pass, ramResult.Status);
        Assert.Equal("A+", ramResult.OverallGrade);
        Assert.Equal(1, ramResult.RankInSection);
        Assert.Equal(1, ramResult.RankInProgram);

        // Verify Hari's Result
        var hariResult = resultsResult.Value.First(r => r.StudentId == hari.Id);
        Assert.Equal(200, hariResult.TotalMaxMarks);
        Assert.Equal(160, hariResult.TotalMarksObtained); // 78 + 82
        Assert.Equal(80.0m, hariResult.Percentage);
        Assert.Equal(ResultStatus.Pass, hariResult.Status);
        Assert.Equal("A", hariResult.OverallGrade);
        Assert.Equal(2, hariResult.RankInSection);

        // Verify Sita's Result
        var sitaResult = resultsResult.Value.First(r => r.StudentId == sita.Id);
        Assert.Equal(ResultStatus.Fail, sitaResult.Status); // Failed Math (absent) & Science (25 < 33)

        // 5. Generate Report Card for Ram
        var reportCardHandler = new GenerateReportCardCommandHandler(context);
        var reportCardCmd = new GenerateReportCardCommand(
            exam.Id,
            ram.Id,
            ClassTeacherRemarks: "Exceptional performance across all subjects.",
            PrincipalRemarks: "Promoted with distinction.");

        var reportCardResult = await reportCardHandler.Handle(reportCardCmd, CancellationToken.None);
        Assert.True(reportCardResult.IsSuccess);
        Assert.Equal("RC-ANNUAL-2026-RAM-001", reportCardResult.Value.ReportCardNumber);
        Assert.Equal("Ram Sharma", reportCardResult.Value.StudentName);
        Assert.Equal(94.0m, reportCardResult.Value.Percentage);
        Assert.Equal(2, reportCardResult.Value.SubjectMarks.Count);
        Assert.Equal("Exceptional performance across all subjects.", reportCardResult.Value.ClassTeacherRemarks);

        // 6. Query Student Report Card
        var getReportCardHandler = new GetStudentReportCardQueryHandler(context);
        var getRcResult = await getReportCardHandler.Handle(new GetStudentReportCardQuery(exam.Id, ram.Id), CancellationToken.None);
        Assert.True(getRcResult.IsSuccess);
        Assert.Equal(reportCardResult.Value.ReportCardNumber, getRcResult.Value.ReportCardNumber);
    }
}
