using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Examinations;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Examinations;

namespace SchoolERP.Application.Examinations;

// --- Commands ---
public record CalculateExamResultsCommand(
    Guid ExamId,
    Guid ProgramId,
    Guid? SectionId = null) : IRequest<Result<IReadOnlyList<ExamResultDto>>>;

public class CalculateExamResultsCommandValidator : AbstractValidator<CalculateExamResultsCommand>
{
    public CalculateExamResultsCommandValidator()
    {
        RuleFor(x => x.ExamId).NotEmpty();
        RuleFor(x => x.ProgramId).NotEmpty();
    }
}

public class CalculateExamResultsCommandHandler : IRequestHandler<CalculateExamResultsCommand, Result<IReadOnlyList<ExamResultDto>>>
{
    private readonly IApplicationDbContext _context;

    public CalculateExamResultsCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<ExamResultDto>>> Handle(CalculateExamResultsCommand request, CancellationToken cancellationToken)
    {
        var exam = await _context.Exams
            .Include(e => e.GradingScale)
                .ThenInclude(g => g!.Rules)
            .FirstOrDefaultAsync(e => e.Id == request.ExamId, cancellationToken);

        if (exam == null)
        {
            return Result.Failure<IReadOnlyList<ExamResultDto>>(Error.NotFound("Exam.NotFound", "Exam not found."));
        }

        var program = await _context.Programs.FindAsync(new object[] { request.ProgramId }, cancellationToken);
        if (program == null)
        {
            return Result.Failure<IReadOnlyList<ExamResultDto>>(Error.NotFound("Program.NotFound", "Program/Grade not found."));
        }

        var examSubjects = await _context.ExamSubjects
            .Include(s => s.Subject)
            .Include(s => s.MarksEntries)
            .Where(s => s.ExamId == request.ExamId && s.ProgramId == request.ProgramId)
            .ToListAsync(cancellationToken);

        if (!examSubjects.Any())
        {
            return Result.Failure<IReadOnlyList<ExamResultDto>>(Error.Validation("Exam.NoSubjects", "No exam subjects scheduled for this program."));
        }

        var enrollmentsQuery = _context.Enrollments
            .Include(en => en.Student)
            .Include(en => en.Section)
            .Where(en => en.AcademicYearId == exam.AcademicYearId &&
                         en.ProgramId == request.ProgramId &&
                         en.Status == EnrollmentStatus.Active);

        if (request.SectionId.HasValue)
        {
            enrollmentsQuery = enrollmentsQuery.Where(en => en.SectionId == request.SectionId.Value);
        }

        var enrollments = await enrollmentsQuery.ToListAsync(cancellationToken);
        if (!enrollments.Any())
        {
            return Result.Failure<IReadOnlyList<ExamResultDto>>(Error.Validation("Exam.NoStudents", "No active students enrolled for this exam program/section."));
        }

        var gradingRules = exam.GradingScale?.Rules?.OrderByDescending(r => r.MinPercentage).ToList() ?? new List<GradeRule>();

        var existingResults = await _context.ExamResults
            .Where(r => r.ExamId == request.ExamId && r.ProgramId == request.ProgramId)
            .ToDictionaryAsync(r => r.StudentId, cancellationToken);

        var totalExamMaxMarks = examSubjects.Sum(s => s.TotalMaxMarks);
        var calculatedResults = new List<ExamResult>();

        foreach (var enrollment in enrollments)
        {
            var studentId = enrollment.StudentId;
            decimal studentTotalObtained = 0;
            bool hasFailedSubject = false;
            bool isAllAbsent = true;
            decimal totalGradePoints = 0;
            int evaluatedSubjectCount = 0;

            foreach (var examSubject in examSubjects)
            {
                var markEntry = examSubject.MarksEntries.FirstOrDefault(m => m.StudentId == studentId);
                if (markEntry != null)
                {
                    if (!markEntry.IsAbsent)
                    {
                        isAllAbsent = false;
                        var obtained = markEntry.TotalMarksObtained;
                        studentTotalObtained += obtained;

                        if (obtained < examSubject.PassingMarks)
                        {
                            hasFailedSubject = true;
                        }

                        if (markEntry.GradePoint.HasValue)
                        {
                            totalGradePoints += markEntry.GradePoint.Value;
                            evaluatedSubjectCount++;
                        }
                    }
                    else
                    {
                        hasFailedSubject = true;
                    }
                }
                else
                {
                    // No mark recorded yet for this subject
                    hasFailedSubject = true;
                }
            }

            var percentage = totalExamMaxMarks > 0 ? Math.Round((studentTotalObtained / totalExamMaxMarks) * 100, 2) : 0;
            var gpa = evaluatedSubjectCount > 0 ? Math.Round(totalGradePoints / evaluatedSubjectCount, 2) : 0;

            var matchedRule = gradingRules.FirstOrDefault(r => percentage >= r.MinPercentage && percentage <= r.MaxPercentage);
            var overallGrade = matchedRule?.GradeLetter ?? (percentage >= 40 ? "P" : "F");

            var status = isAllAbsent
                ? ResultStatus.Absent
                : (hasFailedSubject ? ResultStatus.Fail : ResultStatus.Pass);

            if (existingResults.TryGetValue(studentId, out var existingResult))
            {
                existingResult.TotalMaxMarks = totalExamMaxMarks;
                existingResult.TotalMarksObtained = studentTotalObtained;
                existingResult.GPA = gpa;
                existingResult.OverallGrade = overallGrade;
                existingResult.Status = status;
                existingResult.SectionId = enrollment.SectionId;
                calculatedResults.Add(existingResult);
            }
            else
            {
                var newResult = new ExamResult(
                    exam.OrganizationId,
                    exam.Id,
                    studentId,
                    exam.AcademicYearId,
                    request.ProgramId,
                    totalExamMaxMarks,
                    studentTotalObtained,
                    gpa,
                    overallGrade,
                    status,
                    enrollment.SectionId,
                    campusId: exam.CampusId);

                _context.ExamResults.Add(newResult);
                calculatedResults.Add(newResult);
            }
        }

        // Calculate Ranks in Program (Order by TotalMarksObtained desc)
        var rankedInProgram = calculatedResults
            .OrderByDescending(r => r.Status == ResultStatus.Pass)
            .ThenByDescending(r => r.TotalMarksObtained)
            .ToList();

        for (int i = 0; i < rankedInProgram.Count; i++)
        {
            rankedInProgram[i].RankInProgram = i + 1;
        }

        // Calculate Ranks in Section
        var sectionGroups = calculatedResults.GroupBy(r => r.SectionId);
        foreach (var group in sectionGroups)
        {
            var rankedInSection = group
                .OrderByDescending(r => r.Status == ResultStatus.Pass)
                .ThenByDescending(r => r.TotalMarksObtained)
                .ToList();

            for (int i = 0; i < rankedInSection.Count; i++)
            {
                rankedInSection[i].RankInSection = i + 1;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Build return DTOs
        var studentMap = enrollments.ToDictionary(en => en.StudentId);
        var dtos = new List<ExamResultDto>();

        foreach (var r in calculatedResults)
        {
            var en = studentMap[r.StudentId];
            var subjectMarks = examSubjects.Select(s =>
            {
                var mark = s.MarksEntries.FirstOrDefault(m => m.StudentId == r.StudentId);
                return new MarksEntryDto(
                    mark?.Id ?? Guid.Empty,
                    s.Id,
                    r.StudentId,
                    $"{en.Student.FirstName} {en.Student.LastName}",
                    en.Student.AdmissionNumber,
                    en.RollNumber,
                    mark?.TheoryMarksObtained,
                    mark?.PracticalMarksObtained,
                    mark?.TotalMarksObtained ?? 0,
                    s.TotalMaxMarks,
                    s.TotalMaxMarks > 0 && mark != null ? Math.Round((mark.TotalMarksObtained / s.TotalMaxMarks) * 100, 2) : 0,
                    mark?.GradeLetter,
                    mark?.GradePoint,
                    mark?.IsAbsent ?? false,
                    mark?.Remarks);
            }).ToList();

            dtos.Add(new ExamResultDto(
                r.Id,
                r.ExamId,
                exam.Name,
                r.StudentId,
                $"{en.Student.FirstName} {en.Student.LastName}",
                en.Student.AdmissionNumber,
                en.RollNumber,
                r.ProgramId,
                program.Name,
                r.SectionId,
                en.Section?.Name,
                r.TotalMaxMarks,
                r.TotalMarksObtained,
                r.Percentage,
                r.GPA,
                r.OverallGrade,
                r.Status,
                r.RankInSection,
                r.RankInProgram,
                subjectMarks));
        }

        return Result.Success<IReadOnlyList<ExamResultDto>>(dtos);
    }
}

public record GenerateReportCardCommand(
    Guid ExamId,
    Guid StudentId,
    string? ClassTeacherRemarks = null,
    string? PrincipalRemarks = null) : IRequest<Result<ReportCardDto>>;

public class GenerateReportCardCommandValidator : AbstractValidator<GenerateReportCardCommand>
{
    public GenerateReportCardCommandValidator()
    {
        RuleFor(x => x.ExamId).NotEmpty();
        RuleFor(x => x.StudentId).NotEmpty();
    }
}

public class GenerateReportCardCommandHandler : IRequestHandler<GenerateReportCardCommand, Result<ReportCardDto>>
{
    private readonly IApplicationDbContext _context;

    public GenerateReportCardCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ReportCardDto>> Handle(GenerateReportCardCommand request, CancellationToken cancellationToken)
    {
        var exam = await _context.Exams
            .Include(e => e.AcademicYear)
            .FirstOrDefaultAsync(e => e.Id == request.ExamId, cancellationToken);

        if (exam == null)
        {
            return Result.Failure<ReportCardDto>(Error.NotFound("Exam.NotFound", "Exam not found."));
        }

        var student = await _context.Students.FindAsync(new object[] { request.StudentId }, cancellationToken);
        if (student == null)
        {
            return Result.Failure<ReportCardDto>(Error.NotFound("Student.NotFound", "Student not found."));
        }

        var examResult = await _context.ExamResults
            .Include(r => r.Program)
            .Include(r => r.Section)
            .FirstOrDefaultAsync(r => r.ExamId == request.ExamId && r.StudentId == request.StudentId, cancellationToken);

        if (examResult == null)
        {
            return Result.Failure<ReportCardDto>(Error.NotFound("ExamResult.NotFound", "Exam result has not been calculated yet for this student."));
        }

        var enrollment = await _context.Enrollments
            .FirstOrDefaultAsync(en => en.StudentId == request.StudentId && en.AcademicYearId == exam.AcademicYearId && en.Status == EnrollmentStatus.Active, cancellationToken);

        // Attendance summary if exists
        var attendanceSummary = await _context.AttendanceSummaries
            .FirstOrDefaultAsync(a => a.StudentId == request.StudentId && a.AcademicYearId == exam.AcademicYearId, cancellationToken);

        var reportCardNumber = $"RC-{exam.Code}-{student.AdmissionNumber}";

        var reportCard = await _context.ReportCards
            .FirstOrDefaultAsync(rc => rc.ExamId == request.ExamId && rc.StudentId == request.StudentId, cancellationToken);

        if (reportCard != null)
        {
            reportCard.TotalMaxMarks = examResult.TotalMaxMarks;
            reportCard.TotalMarksObtained = examResult.TotalMarksObtained;
            reportCard.Percentage = examResult.Percentage;
            reportCard.GPA = examResult.GPA;
            reportCard.OverallGrade = examResult.OverallGrade;
            reportCard.ResultStatus = examResult.Status;
            reportCard.OverallAttendancePercentage = attendanceSummary?.AttendancePercentage;
            reportCard.ClassTeacherRemarks = request.ClassTeacherRemarks ?? reportCard.ClassTeacherRemarks;
            reportCard.PrincipalRemarks = request.PrincipalRemarks ?? reportCard.PrincipalRemarks;
            reportCard.IssueDate = DateOnly.FromDateTime(DateTime.UtcNow);
        }
        else
        {
            reportCard = new ReportCard(
                exam.OrganizationId,
                reportCardNumber,
                request.StudentId,
                request.ExamId,
                exam.AcademicYearId,
                DateOnly.FromDateTime(DateTime.UtcNow),
                examResult.TotalMaxMarks,
                examResult.TotalMarksObtained,
                examResult.Percentage,
                examResult.GPA,
                examResult.OverallGrade,
                examResult.Status,
                attendanceSummary?.AttendancePercentage,
                request.ClassTeacherRemarks,
                request.PrincipalRemarks,
                exam.CampusId);

            _context.ReportCards.Add(reportCard);
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Fetch subject marks
        var examSubjects = await _context.ExamSubjects
            .Include(s => s.Subject)
            .Include(s => s.MarksEntries)
            .Where(s => s.ExamId == request.ExamId && s.ProgramId == examResult.ProgramId)
            .ToListAsync(cancellationToken);

        var subjectMarks = examSubjects.Select(s =>
        {
            var mark = s.MarksEntries.FirstOrDefault(m => m.StudentId == request.StudentId);
            return new MarksEntryDto(
                mark?.Id ?? Guid.Empty,
                s.Id,
                request.StudentId,
                $"{student.FirstName} {student.LastName}",
                student.AdmissionNumber,
                enrollment?.RollNumber,
                mark?.TheoryMarksObtained,
                mark?.PracticalMarksObtained,
                mark?.TotalMarksObtained ?? 0,
                s.TotalMaxMarks,
                s.TotalMaxMarks > 0 && mark != null ? Math.Round((mark.TotalMarksObtained / s.TotalMaxMarks) * 100, 2) : 0,
                mark?.GradeLetter,
                mark?.GradePoint,
                mark?.IsAbsent ?? false,
                mark?.Remarks);
        }).ToList();

        var dto = new ReportCardDto(
            reportCard.Id,
            reportCard.OrganizationId,
            reportCard.CampusId,
            reportCard.ReportCardNumber,
            reportCard.StudentId,
            $"{student.FirstName} {student.LastName}",
            student.AdmissionNumber,
            enrollment?.RollNumber,
            reportCard.ExamId,
            exam.Name,
            reportCard.AcademicYearId,
            exam.AcademicYear.Name,
            examResult.Program.Name,
            examResult.Section?.Name,
            reportCard.IssueDate,
            reportCard.OverallAttendancePercentage,
            reportCard.TotalMaxMarks,
            reportCard.TotalMarksObtained,
            reportCard.Percentage,
            reportCard.GPA,
            reportCard.OverallGrade,
            reportCard.ResultStatus,
            reportCard.ClassTeacherRemarks,
            reportCard.PrincipalRemarks,
            reportCard.IsPublished,
            subjectMarks);

        return Result.Success(dto);
    }
}

// --- Queries ---
public record GetStudentExamResultsQuery(Guid StudentId, Guid? ExamId = null) : IRequest<Result<IReadOnlyList<ExamResultDto>>>;

public class GetStudentExamResultsQueryHandler : IRequestHandler<GetStudentExamResultsQuery, Result<IReadOnlyList<ExamResultDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetStudentExamResultsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<ExamResultDto>>> Handle(GetStudentExamResultsQuery request, CancellationToken cancellationToken)
    {
        var student = await _context.Students.FindAsync(new object[] { request.StudentId }, cancellationToken);
        if (student == null)
        {
            return Result.Failure<IReadOnlyList<ExamResultDto>>(Error.NotFound("Student.NotFound", "Student not found."));
        }

        var query = _context.ExamResults
            .AsNoTracking()
            .Include(r => r.Exam)
            .Include(r => r.Program)
            .Include(r => r.Section)
            .Where(r => r.StudentId == request.StudentId);

        if (request.ExamId.HasValue)
        {
            query = query.Where(r => r.ExamId == request.ExamId.Value);
        }

        var results = await query.ToListAsync(cancellationToken);
        var dtos = new List<ExamResultDto>();

        foreach (var r in results)
        {
            var examSubjects = await _context.ExamSubjects
                .AsNoTracking()
                .Include(s => s.Subject)
                .Include(s => s.MarksEntries.Where(m => m.StudentId == request.StudentId))
                .Where(s => s.ExamId == r.ExamId && s.ProgramId == r.ProgramId)
                .ToListAsync(cancellationToken);

            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(en => en.StudentId == request.StudentId && en.AcademicYearId == r.AcademicYearId && en.Status == EnrollmentStatus.Active, cancellationToken);

            var marksList = examSubjects.Select(s =>
            {
                var mark = s.MarksEntries.FirstOrDefault();
                return new MarksEntryDto(
                    mark?.Id ?? Guid.Empty,
                    s.Id,
                    request.StudentId,
                    $"{student.FirstName} {student.LastName}",
                    student.AdmissionNumber,
                    enrollment?.RollNumber,
                    mark?.TheoryMarksObtained,
                    mark?.PracticalMarksObtained,
                    mark?.TotalMarksObtained ?? 0,
                    s.TotalMaxMarks,
                    s.TotalMaxMarks > 0 && mark != null ? Math.Round((mark.TotalMarksObtained / s.TotalMaxMarks) * 100, 2) : 0,
                    mark?.GradeLetter,
                    mark?.GradePoint,
                    mark?.IsAbsent ?? false,
                    mark?.Remarks);
            }).ToList();

            dtos.Add(new ExamResultDto(
                r.Id,
                r.ExamId,
                r.Exam.Name,
                r.StudentId,
                $"{student.FirstName} {student.LastName}",
                student.AdmissionNumber,
                enrollment?.RollNumber,
                r.ProgramId,
                r.Program.Name,
                r.SectionId,
                r.Section?.Name,
                r.TotalMaxMarks,
                r.TotalMarksObtained,
                r.Percentage,
                r.GPA,
                r.OverallGrade,
                r.Status,
                r.RankInSection,
                r.RankInProgram,
                marksList));
        }

        return Result.Success<IReadOnlyList<ExamResultDto>>(dtos);
    }
}

public record GetStudentReportCardQuery(Guid ExamId, Guid StudentId) : IRequest<Result<ReportCardDto>>;

public class GetStudentReportCardQueryHandler : IRequestHandler<GetStudentReportCardQuery, Result<ReportCardDto>>
{
    private readonly IApplicationDbContext _context;

    public GetStudentReportCardQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ReportCardDto>> Handle(GetStudentReportCardQuery request, CancellationToken cancellationToken)
    {
        var reportCard = await _context.ReportCards
            .AsNoTracking()
            .Include(rc => rc.Exam)
            .Include(rc => rc.AcademicYear)
            .Include(rc => rc.Student)
            .FirstOrDefaultAsync(rc => rc.ExamId == request.ExamId && rc.StudentId == request.StudentId, cancellationToken);

        if (reportCard == null)
        {
            return Result.Failure<ReportCardDto>(Error.NotFound("ReportCard.NotFound", "Report card not found for this student and exam."));
        }

        var examResult = await _context.ExamResults
            .Include(r => r.Program)
            .Include(r => r.Section)
            .FirstOrDefaultAsync(r => r.ExamId == request.ExamId && r.StudentId == request.StudentId, cancellationToken);

        var enrollment = await _context.Enrollments
            .FirstOrDefaultAsync(en => en.StudentId == request.StudentId && en.AcademicYearId == reportCard.AcademicYearId && en.Status == EnrollmentStatus.Active, cancellationToken);

        var examSubjects = await _context.ExamSubjects
            .AsNoTracking()
            .Include(s => s.Subject)
            .Include(s => s.MarksEntries.Where(m => m.StudentId == request.StudentId))
            .Where(s => s.ExamId == request.ExamId && (examResult == null || s.ProgramId == examResult.ProgramId))
            .ToListAsync(cancellationToken);

        var subjectMarks = examSubjects.Select(s =>
        {
            var mark = s.MarksEntries.FirstOrDefault();
            return new MarksEntryDto(
                mark?.Id ?? Guid.Empty,
                s.Id,
                request.StudentId,
                $"{reportCard.Student.FirstName} {reportCard.Student.LastName}",
                reportCard.Student.AdmissionNumber,
                enrollment?.RollNumber,
                mark?.TheoryMarksObtained,
                mark?.PracticalMarksObtained,
                mark?.TotalMarksObtained ?? 0,
                s.TotalMaxMarks,
                s.TotalMaxMarks > 0 && mark != null ? Math.Round((mark.TotalMarksObtained / s.TotalMaxMarks) * 100, 2) : 0,
                mark?.GradeLetter,
                mark?.GradePoint,
                mark?.IsAbsent ?? false,
                mark?.Remarks);
        }).ToList();

        var dto = new ReportCardDto(
            reportCard.Id,
            reportCard.OrganizationId,
            reportCard.CampusId,
            reportCard.ReportCardNumber,
            reportCard.StudentId,
            $"{reportCard.Student.FirstName} {reportCard.Student.LastName}",
            reportCard.Student.AdmissionNumber,
            enrollment?.RollNumber,
            reportCard.ExamId,
            reportCard.Exam.Name,
            reportCard.AcademicYearId,
            reportCard.AcademicYear.Name,
            examResult?.Program.Name ?? "N/A",
            examResult?.Section?.Name,
            reportCard.IssueDate,
            reportCard.OverallAttendancePercentage,
            reportCard.TotalMaxMarks,
            reportCard.TotalMarksObtained,
            reportCard.Percentage,
            reportCard.GPA,
            reportCard.OverallGrade,
            reportCard.ResultStatus,
            reportCard.ClassTeacherRemarks,
            reportCard.PrincipalRemarks,
            reportCard.IsPublished,
            subjectMarks);

        return Result.Success(dto);
    }
}
