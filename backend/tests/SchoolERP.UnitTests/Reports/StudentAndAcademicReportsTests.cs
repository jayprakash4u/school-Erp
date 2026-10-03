using SchoolERP.Application.Reports;
using SchoolERP.Contracts.Academics;
using SchoolERP.Contracts.Attendance;
using SchoolERP.Contracts.Examinations;
using SchoolERP.Contracts.Staff;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Attendance;
using SchoolERP.Domain.Entities.Examinations;
using SchoolERP.Domain.Entities.Organization;
using SchoolERP.Domain.Entities.Staff;
using SchoolERP.Domain.Entities.Students;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Reports;

public class StudentAndAcademicReportsTests
{
    [Fact]
    public async Task Student_Attendance_And_ExamResult_Reports_ShouldCalculateAccurately()
    {
        // =========================================================================
        // 1. Arrange Master Data (Org, Year, Program, Section, Students)
        // =========================================================================
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new SchoolERP.Domain.Entities.Organization.Organization("SCH-REP", "Oxford Academy");
        context.Organizations.Add(org);

        var academicYear = new AcademicYear(org.Id, "2026/2027", "Academic Year 2026-27", new DateOnly(2026, 4, 1), new DateOnly(2027, 3, 31), isCurrent: true);
        context.AcademicYears.Add(academicYear);

        var academicLevel = new AcademicLevel(org.Id, "SEC", "Secondary Level", AcademicLevelCategory.Secondary);
        context.AcademicLevels.Add(academicLevel);

        var program10 = new SchoolERP.Domain.Entities.Academics.Program(org.Id, academicLevel.Id, "PROG-10", "Grade 10", durationYears: 1);
        var program9 = new SchoolERP.Domain.Entities.Academics.Program(org.Id, academicLevel.Id, "PROG-09", "Grade 9", durationYears: 1);
        context.Programs.AddRange(program10, program9);

        var sec10A = new Section(org.Id, program10.Id, academicYear.Id, "10-A", "Section A");
        var sec10B = new Section(org.Id, program10.Id, academicYear.Id, "10-B", "Section B");
        context.Sections.AddRange(sec10A, sec10B);

        var s1 = new Student(org.Id, "STU-001", "Aarav", "Sharma", Gender.Male, new DateOnly(2010, 1, 1)) { Status = StudentStatus.Active };
        var s2 = new Student(org.Id, "STU-002", "Pooja", "Shrestha", Gender.Female, new DateOnly(2010, 2, 2)) { Status = StudentStatus.Active };
        var s3 = new Student(org.Id, "STU-003", "Rohan", "Thapa", Gender.Male, new DateOnly(2010, 3, 3)) { Status = StudentStatus.Active };
        var s4 = new Student(org.Id, "STU-004", "Ananya", "Rai", Gender.Female, new DateOnly(2009, 5, 5)) { Status = StudentStatus.Graduated };
        context.Students.AddRange(s1, s2, s3, s4);

        var e1 = new Enrollment(s1.Id, academicYear.Id, program10.Id, new DateOnly(2026, 4, 1), sec10A.Id, status: EnrollmentStatus.Active);
        var e2 = new Enrollment(s2.Id, academicYear.Id, program10.Id, new DateOnly(2026, 4, 1), sec10A.Id, status: EnrollmentStatus.Active);
        var e3 = new Enrollment(s3.Id, academicYear.Id, program10.Id, new DateOnly(2026, 4, 1), sec10B.Id, status: EnrollmentStatus.Active);
        context.Enrollments.AddRange(e1, e2, e3);

        // Staff & Department Setup
        var dept = new Department(org.Id, "DEPT-SCI", "Science Department");
        context.Departments.Add(dept);
        var desig = new Designation(org.Id, "DES-TCH", "Senior Teacher");
        context.Designations.Add(desig);

        var staff1 = new SchoolERP.Domain.Entities.Staff.Staff(org.Id, "EMP-001", "Ramesh", "Karki", Gender.Male, new DateOnly(1985, 1, 1), "ramesh@oxford.edu", StaffType.Teaching, new DateOnly(2020, 1, 1), departmentId: dept.Id, designationId: desig.Id);
        var staff2 = new SchoolERP.Domain.Entities.Staff.Staff(org.Id, "EMP-002", "Sunita", "Gurung", Gender.Female, new DateOnly(1990, 5, 5), "sunita@oxford.edu", StaffType.NonTeaching, new DateOnly(2021, 2, 1), departmentId: dept.Id, designationId: desig.Id);
        context.Staff.AddRange(staff1, staff2);

        await context.SaveChangesAsync();

        // =========================================================================
        // 2. Test Student & Staff Reports
        // =========================================================================
        var studentReportHandler = new GetStudentReportQueryHandler(context);
        var studentReportRes = await studentReportHandler.Handle(new GetStudentReportQuery(org.Id), CancellationToken.None);

        Assert.True(studentReportRes.IsSuccess);
        Assert.Equal(4, studentReportRes.Value.TotalStudents);
        Assert.Equal(3, studentReportRes.Value.ActiveStudents);
        Assert.Equal(1, studentReportRes.Value.GraduatedStudents);
        Assert.Equal(2, studentReportRes.Value.MaleCount);
        Assert.Equal(2, studentReportRes.Value.FemaleCount);
        Assert.Single(studentReportRes.Value.Programs);
        Assert.Equal("Grade 10", studentReportRes.Value.Programs[0].ProgramName);
        Assert.Equal(3, studentReportRes.Value.Programs[0].TotalStudents);

        var staffReportHandler = new GetStaffReportQueryHandler(context);
        var staffReportRes = await staffReportHandler.Handle(new GetStaffReportQuery(org.Id), CancellationToken.None);

        Assert.True(staffReportRes.IsSuccess);
        Assert.Equal(2, staffReportRes.Value.TotalStaff);
        Assert.Equal(1, staffReportRes.Value.TeachingStaffCount);
        Assert.Equal(1, staffReportRes.Value.NonTeachingStaffCount);
        Assert.Single(staffReportRes.Value.Departments);
        Assert.Equal("Science Department", staffReportRes.Value.Departments[0].DepartmentName);

        // =========================================================================
        // 3. Test Attendance Report
        // =========================================================================
        var session = new AttendanceSession(org.Id, academicYear.Id, program10.Id, sec10A.Id, new DateOnly(2026, 10, 1));
        var att1 = new AttendanceRecord(session.Id, s1.Id, AttendanceStatus.Present);
        var att2 = new AttendanceRecord(session.Id, s2.Id, AttendanceStatus.Absent);
        session.Records.Add(att1);
        session.Records.Add(att2);
        context.AttendanceSessions.Add(session);
        await context.SaveChangesAsync();

        var attHandler = new GetAttendanceReportQueryHandler(context);
        var attRes = await attHandler.Handle(new GetAttendanceReportQuery(org.Id, new DateOnly(2026, 10, 1), new DateOnly(2026, 10, 2)), CancellationToken.None);

        Assert.True(attRes.IsSuccess);
        Assert.Equal(2, attRes.Value.TotalRecords);
        Assert.Equal(1, attRes.Value.PresentCount);
        Assert.Equal(1, attRes.Value.AbsentCount);
        Assert.Equal(50m, attRes.Value.OverallAttendancePercentage);
        Assert.Single(attRes.Value.DailyTrends);
        Assert.Equal(50m, attRes.Value.DailyTrends[0].AttendancePercentage);

        // =========================================================================
        // 4. Test Exam Result Report
        // =========================================================================
        var examType = new ExamType(org.Id, "TERM-1", "First Term Exam");
        context.ExamTypes.Add(examType);

        var exam = new Exam(org.Id, academicYear.Id, examType.Id, "EXAM-T1", "First Term Examination 2026", new DateOnly(2026, 9, 15), new DateOnly(2026, 9, 25));
        context.Exams.Add(exam);

        var subjectMath = new Subject(org.Id, "MATH-10", "Mathematics", SubjectType.Theory, credits: 4m);
        context.Subjects.Add(subjectMath);

        var examSub = new ExamSubject(exam.Id, subjectMath.Id, program10.Id, new DateOnly(2026, 9, 16), maxTheoryMarks: 100, maxPracticalMarks: 0, passingMarks: 40);
        context.ExamSubjects.Add(examSub);

        var m1 = new MarksEntry(examSub.Id, s1.Id, theoryMarksObtained: 90, practicalMarksObtained: 0, gradeLetter: "A+");
        var m2 = new MarksEntry(examSub.Id, s2.Id, theoryMarksObtained: 35, practicalMarksObtained: 0, gradeLetter: "F");
        context.MarksEntries.AddRange(m1, m2);

        var r1 = new ExamResult(org.Id, exam.Id, s1.Id, academicYear.Id, program10.Id, totalMaxMarks: 100, totalMarksObtained: 90, gpa: 4.0m, overallGrade: "A+", status: ResultStatus.Pass, sectionId: sec10A.Id, rankInSection: 1);
        var r2 = new ExamResult(org.Id, exam.Id, s2.Id, academicYear.Id, program10.Id, totalMaxMarks: 100, totalMarksObtained: 35, gpa: 1.6m, overallGrade: "F", status: ResultStatus.Fail, sectionId: sec10A.Id, rankInSection: 2);
        context.ExamResults.AddRange(r1, r2);

        await context.SaveChangesAsync();

        var examReportHandler = new GetExamResultReportQueryHandler(context);
        var examReportRes = await examReportHandler.Handle(new GetExamResultReportQuery(org.Id, exam.Id), CancellationToken.None);

        Assert.True(examReportRes.IsSuccess);
        Assert.Equal(2, examReportRes.Value.TotalStudentsAppeared);
        Assert.Equal(1, examReportRes.Value.PassedStudentsCount);
        Assert.Equal(1, examReportRes.Value.FailedStudentsCount);
        Assert.Equal(50m, examReportRes.Value.PassPercentage);
        Assert.Equal(62.5m, examReportRes.Value.AverageMarks);
        Assert.Equal(2, examReportRes.Value.TopPerformers.Count);
        Assert.Equal("Aarav Sharma", examReportRes.Value.TopPerformers[0].StudentName);
        Assert.Equal(90m, examReportRes.Value.TopPerformers[0].Percentage);
    }
}
