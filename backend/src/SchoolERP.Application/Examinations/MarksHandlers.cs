
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
public record RecordExamMarksCommand(
    Guid ExamSubjectId,
    IReadOnlyList<StudentMarksInput> Entries,
    Guid? EnteredByStaffId = null) : IRequest<Result<IReadOnlyList<MarksEntryDto>>>;

public class RecordExamMarksCommandValidator : AbstractValidator<RecordExamMarksCommand>
{
    public RecordExamMarksCommandValidator()
    {
        RuleFor(x => x.ExamSubjectId).NotEmpty();
        RuleFor(x => x.Entries).NotEmpty().WithMessage("Marks entries cannot be empty.");
    }
}

public class RecordExamMarksCommandHandler : IRequestHandler<RecordExamMarksCommand, Result<IReadOnlyList<MarksEntryDto>>>
{
    private readonly IApplicationDbContext _context;

    public RecordExamMarksCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<MarksEntryDto>>> Handle(RecordExamMarksCommand request, CancellationToken cancellationToken)
    {
        var examSubject = await _context.ExamSubjects
            .Include(s => s.Exam)
                .ThenInclude(e => e.GradingScale)
                    .ThenInclude(g => g!.Rules)
            .Include(s => s.Subject)
            .Include(s => s.Program)
            .FirstOrDefaultAsync(s => s.Id == request.ExamSubjectId, cancellationToken);

        if (examSubject == null)
        {
            return Result.Failure<IReadOnlyList<MarksEntryDto>>(Error.NotFound("ExamSubject.NotFound", "Exam subject paper not found."));
        }

        var gradingRules = examSubject.Exam.GradingScale?.Rules ?? new List<GradeRule>();

        var existingEntries = await _context.MarksEntries
            .Where(m => m.ExamSubjectId == request.ExamSubjectId)
            .ToDictionaryAsync(m => m.StudentId, cancellationToken);

        var studentIds = request.Entries.Select(e => e.StudentId).Distinct().ToList();
        var students = await _context.Students
            .Where(s => studentIds.Contains(s.Id))
            .ToDictionaryAsync(s => s.Id, cancellationToken);

        var enrollments = await _context.Enrollments
            .Where(en => studentIds.Contains(en.StudentId) && en.AcademicYearId == examSubject.Exam.AcademicYearId && en.ProgramId == examSubject.ProgramId && en.Status == EnrollmentStatus.Active)
            .ToDictionaryAsync(en => en.StudentId, cancellationToken);

        var resultList = new List<MarksEntryDto>();

        foreach (var entryInput in request.Entries)
        {
            if (!students.TryGetValue(entryInput.StudentId, out var student))
            {
                continue;
            }

            // Validate marks limits
            if (entryInput.TheoryMarks.HasValue && entryInput.TheoryMarks.Value > examSubject.MaxTheoryMarks)
            {
                return Result.Failure<IReadOnlyList<MarksEntryDto>>(Error.Validation(
                    "Marks.ExceedsMaxTheory",
                    $"Theory marks for student {student.FirstName} ({entryInput.TheoryMarks.Value}) cannot exceed maximum allowed ({examSubject.MaxTheoryMarks})."));
            }

            if (entryInput.PracticalMarks.HasValue && entryInput.PracticalMarks.Value > examSubject.MaxPracticalMarks)
            {
                return Result.Failure<IReadOnlyList<MarksEntryDto>>(Error.Validation(
                    "Marks.ExceedsMaxPractical",
                    $"Practical marks for student {student.FirstName} ({entryInput.PracticalMarks.Value}) cannot exceed maximum allowed ({examSubject.MaxPracticalMarks})."));
            }

            decimal totalObtained = 0;
            string? gradeLetter = null;
            decimal? gradePoint = null;

            if (!entryInput.IsAbsent)
            {
                totalObtained = (entryInput.TheoryMarks ?? 0) + (entryInput.PracticalMarks ?? 0);
                var percentage = examSubject.TotalMaxMarks > 0 ? (totalObtained / examSubject.TotalMaxMarks) * 100 : 0;

                var matchedRule = gradingRules
                    .FirstOrDefault(r => percentage >= r.MinPercentage && percentage <= r.MaxPercentage);

                if (matchedRule != null)
                {
                    gradeLetter = matchedRule.GradeLetter;
                    gradePoint = matchedRule.GradePoint;
                }
            }

            enrollments.TryGetValue(student.Id, out var enrollment);

            if (existingEntries.TryGetValue(student.Id, out var existing))
            {
                existing.TheoryMarksObtained = entryInput.IsAbsent ? null : entryInput.TheoryMarks;
                existing.PracticalMarksObtained = entryInput.IsAbsent ? null : entryInput.PracticalMarks;
                existing.IsAbsent = entryInput.IsAbsent;
                existing.Remarks = entryInput.Remarks;
                existing.GradeLetter = gradeLetter;
                existing.GradePoint = gradePoint;
                existing.EnteredByStaffId = request.EnteredByStaffId ?? existing.EnteredByStaffId;
                if (enrollment != null)
                {
                    existing.EnrollmentId = enrollment.Id;
                }

                resultList.Add(new MarksEntryDto(
                    existing.Id,
                    existing.ExamSubjectId,
                    student.Id,
                    $"{student.FirstName} {student.LastName}",
                    student.AdmissionNumber,
                    enrollment?.RollNumber,
                    existing.TheoryMarksObtained,
                    existing.PracticalMarksObtained,
                    existing.TotalMarksObtained,
                    examSubject.TotalMaxMarks,
                    examSubject.TotalMaxMarks > 0 ? Math.Round((existing.TotalMarksObtained / examSubject.TotalMaxMarks) * 100, 2) : 0,
                    existing.GradeLetter,
                    existing.GradePoint,
                    existing.IsAbsent,
                    existing.Remarks));
            }
            else
            {
                var newEntry = new MarksEntry(
                    examSubject.Id,
                    student.Id,
                    entryInput.IsAbsent ? null : entryInput.TheoryMarks,
                    entryInput.IsAbsent ? null : entryInput.PracticalMarks,
                    entryInput.IsAbsent,
                    enrollment?.Id,
                    gradeLetter,
                    gradePoint,
                    entryInput.Remarks)
                {
                    EnteredByStaffId = request.EnteredByStaffId
                };

                _context.MarksEntries.Add(newEntry);

                resultList.Add(new MarksEntryDto(
                    newEntry.Id,
                    newEntry.ExamSubjectId,
                    student.Id,
                    $"{student.FirstName} {student.LastName}",
                    student.AdmissionNumber,
                    enrollment?.RollNumber,
                    newEntry.TheoryMarksObtained,
                    newEntry.PracticalMarksObtained,
                    newEntry.TotalMarksObtained,
                    examSubject.TotalMaxMarks,
                    examSubject.TotalMaxMarks > 0 ? Math.Round((newEntry.TotalMarksObtained / examSubject.TotalMaxMarks) * 100, 2) : 0,
                    newEntry.GradeLetter,
                    newEntry.GradePoint,
                    newEntry.IsAbsent,
                    newEntry.Remarks));
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success<IReadOnlyList<MarksEntryDto>>(resultList);
    }
}

// --- Queries ---
public record GetExamMarksRosterQuery(Guid ExamSubjectId) : IRequest<Result<ExamMarksRosterDto>>;

public class GetExamMarksRosterQueryHandler : IRequestHandler<GetExamMarksRosterQuery, Result<ExamMarksRosterDto>>
{
    private readonly IApplicationDbContext _context;

    public GetExamMarksRosterQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ExamMarksRosterDto>> Handle(GetExamMarksRosterQuery request, CancellationToken cancellationToken)
    {
        var examSubject = await _context.ExamSubjects
            .AsNoTracking()
            .Include(s => s.Exam)
            .Include(s => s.Subject)
            .Include(s => s.Program)
            .Include(s => s.MarksEntries)
                .ThenInclude(m => m.Student)
            .FirstOrDefaultAsync(s => s.Id == request.ExamSubjectId, cancellationToken);

        if (examSubject == null)
        {
            return Result.Failure<ExamMarksRosterDto>(Error.NotFound("ExamSubject.NotFound", "Exam subject paper not found."));
        }

        // Get all active enrollments for this Program and Exam's Academic Year
        var enrollments = await _context.Enrollments
            .AsNoTracking()
            .Include(en => en.Student)
            .Where(en => en.AcademicYearId == examSubject.Exam.AcademicYearId &&
                         en.ProgramId == examSubject.ProgramId &&
                         en.Status == EnrollmentStatus.Active)
            .OrderBy(en => en.RollNumber)
            .ThenBy(en => en.Student.FirstName)
            .ToListAsync(cancellationToken);

        var existingMarksDict = examSubject.MarksEntries.ToDictionary(m => m.StudentId);

        var studentDtos = new List<MarksEntryDto>();

        foreach (var en in enrollments)
        {
            if (existingMarksDict.TryGetValue(en.StudentId, out var mark))
            {
                studentDtos.Add(new MarksEntryDto(
                    mark.Id,
                    mark.ExamSubjectId,
                    en.StudentId,
                    $"{en.Student.FirstName} {en.Student.LastName}",
                    en.Student.AdmissionNumber,
                    en.RollNumber,
                    mark.TheoryMarksObtained,
                    mark.PracticalMarksObtained,
                    mark.TotalMarksObtained,
                    examSubject.TotalMaxMarks,
                    examSubject.TotalMaxMarks > 0 ? Math.Round((mark.TotalMarksObtained / examSubject.TotalMaxMarks) * 100, 2) : 0,
                    mark.GradeLetter,
                    mark.GradePoint,
                    mark.IsAbsent,
                    mark.Remarks));
            }
            else
            {
                studentDtos.Add(new MarksEntryDto(
                    Guid.Empty,
                    examSubject.Id,
                    en.StudentId,
                    $"{en.Student.FirstName} {en.Student.LastName}",
                    en.Student.AdmissionNumber,
                    en.RollNumber,
                    null,
                    null,
                    0,
                    examSubject.TotalMaxMarks,
                    0,
                    null,
                    null,
                    false,
                    null));
            }
        }

        var roster = new ExamMarksRosterDto(
            examSubject.Id,
            examSubject.Exam.Name,
            examSubject.Subject.Name,
            examSubject.Program.Name,
            examSubject.MaxTheoryMarks,
            examSubject.MaxPracticalMarks,
            examSubject.TotalMaxMarks,
            examSubject.PassingMarks,
            studentDtos);

        return Result.Success(roster);
    }
}
