using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Examinations;
using SchoolERP.Domain.Entities.Examinations;

namespace SchoolERP.Application.Examinations;

// --- Commands ---
public record CreateExamCommand(
    Guid OrganizationId,
    Guid AcademicYearId,
    Guid ExamTypeId,
    string Code,
    string Name,
    DateOnly StartDate,
    DateOnly EndDate,
    Guid? AcademicPeriodId = null,
    Guid? GradingScaleId = null,
    Guid? CampusId = null) : IRequest<Result<ExamDto>>;

public class CreateExamCommandValidator : AbstractValidator<CreateExamCommand>
{
    public CreateExamCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.AcademicYearId).NotEmpty();
        RuleFor(x => x.ExamTypeId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.StartDate).NotEmpty();
        RuleFor(x => x.EndDate).GreaterThanOrEqualTo(x => x.StartDate)
            .WithMessage("End date must be greater than or equal to start date.");
    }
}

public class CreateExamCommandHandler : IRequestHandler<CreateExamCommand, Result<ExamDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateExamCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ExamDto>> Handle(CreateExamCommand request, CancellationToken cancellationToken)
    {
        var year = await _context.AcademicYears.FindAsync(new object[] { request.AcademicYearId }, cancellationToken);
        if (year == null)
        {
            return Result.Failure<ExamDto>(Error.NotFound("AcademicYear.NotFound", "Academic year not found."));
        }

        var examType = await _context.ExamTypes.FindAsync(new object[] { request.ExamTypeId }, cancellationToken);
        if (examType == null)
        {
            return Result.Failure<ExamDto>(Error.NotFound("ExamType.NotFound", "Exam type not found."));
        }

        var codeExists = await _context.Exams.AnyAsync(
            e => e.OrganizationId == request.OrganizationId &&
                 e.AcademicYearId == request.AcademicYearId &&
                 e.Code.ToLower() == request.Code.ToLower(),
            cancellationToken);

        if (codeExists)
        {
            return Result.Failure<ExamDto>(Error.Conflict("Exam.DuplicateCode", $"Exam with code '{request.Code}' already exists for this academic year."));
        }

        // If grading scale is not provided, find default grading scale for organization
        var gradingScaleId = request.GradingScaleId;
        if (!gradingScaleId.HasValue)
        {
            var defaultScale = await _context.GradingScales
                .FirstOrDefaultAsync(g => g.OrganizationId == request.OrganizationId && g.IsDefault, cancellationToken);
            gradingScaleId = defaultScale?.Id;
        }

        var exam = new Exam(
            request.OrganizationId,
            request.AcademicYearId,
            request.ExamTypeId,
            request.Code,
            request.Name,
            request.StartDate,
            request.EndDate,
            request.AcademicPeriodId,
            gradingScaleId,
            request.CampusId);

        _context.Exams.Add(exam);
        await _context.SaveChangesAsync(cancellationToken);

        string? periodName = null;
        if (exam.AcademicPeriodId.HasValue)
        {
            var period = await _context.AcademicPeriods.FindAsync(new object[] { exam.AcademicPeriodId.Value }, cancellationToken);
            periodName = period?.Name;
        }

        var dto = new ExamDto(
            exam.Id,
            exam.OrganizationId,
            exam.CampusId,
            exam.AcademicYearId,
            year.Name,
            exam.AcademicPeriodId,
            periodName,
            exam.ExamTypeId,
            examType.Name,
            exam.GradingScaleId,
            exam.Code,
            exam.Name,
            exam.StartDate,
            exam.EndDate,
            exam.Status,
            exam.IsPublished,
            0,
            exam.CreatedAtUtc);

        return Result.Success(dto);
    }
}

public record ScheduleExamSubjectCommand(
    Guid ExamId,
    Guid SubjectId,
    Guid ProgramId,
    DateOnly ExamDate,
    TimeOnly? StartTime = null,
    TimeOnly? EndTime = null,
    decimal MaxTheoryMarks = 80,
    decimal MaxPracticalMarks = 20,
    decimal PassingMarks = 33) : IRequest<Result<ExamSubjectDto>>;

public class ScheduleExamSubjectCommandValidator : AbstractValidator<ScheduleExamSubjectCommand>
{
    public ScheduleExamSubjectCommandValidator()
    {
        RuleFor(x => x.ExamId).NotEmpty();
        RuleFor(x => x.SubjectId).NotEmpty();
        RuleFor(x => x.ProgramId).NotEmpty();
        RuleFor(x => x.ExamDate).NotEmpty();
        RuleFor(x => x.MaxTheoryMarks).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MaxPracticalMarks).GreaterThanOrEqualTo(0);
        RuleFor(x => x.PassingMarks).GreaterThanOrEqualTo(0);
    }
}

public class ScheduleExamSubjectCommandHandler : IRequestHandler<ScheduleExamSubjectCommand, Result<ExamSubjectDto>>
{
    private readonly IApplicationDbContext _context;

    public ScheduleExamSubjectCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ExamSubjectDto>> Handle(ScheduleExamSubjectCommand request, CancellationToken cancellationToken)
    {
        var exam = await _context.Exams.FindAsync(new object[] { request.ExamId }, cancellationToken);
        if (exam == null)
        {
            return Result.Failure<ExamSubjectDto>(Error.NotFound("Exam.NotFound", "Exam not found."));
        }

        var subject = await _context.Subjects.FindAsync(new object[] { request.SubjectId }, cancellationToken);
        if (subject == null)
        {
            return Result.Failure<ExamSubjectDto>(Error.NotFound("Subject.NotFound", "Subject not found."));
        }

        var program = await _context.Programs.FindAsync(new object[] { request.ProgramId }, cancellationToken);
        if (program == null)
        {
            return Result.Failure<ExamSubjectDto>(Error.NotFound("Program.NotFound", "Program not found."));
        }

        var existingSubject = await _context.ExamSubjects
            .FirstOrDefaultAsync(s => s.ExamId == request.ExamId && s.SubjectId == request.SubjectId && s.ProgramId == request.ProgramId, cancellationToken);

        if (existingSubject != null)
        {
            // Update existing schedule
            existingSubject.ExamDate = request.ExamDate;
            existingSubject.StartTime = request.StartTime;
            existingSubject.EndTime = request.EndTime;
            existingSubject.MaxTheoryMarks = request.MaxTheoryMarks;
            existingSubject.MaxPracticalMarks = request.MaxPracticalMarks;
            existingSubject.PassingMarks = request.PassingMarks;
        }
        else
        {
            existingSubject = new ExamSubject(
                request.ExamId,
                request.SubjectId,
                request.ProgramId,
                request.ExamDate,
                request.MaxTheoryMarks,
                request.MaxPracticalMarks,
                request.PassingMarks,
                request.StartTime,
                request.EndTime);

            _context.ExamSubjects.Add(existingSubject);
        }

        await _context.SaveChangesAsync(cancellationToken);

        var evaluatedCount = await _context.MarksEntries
            .CountAsync(m => m.ExamSubjectId == existingSubject.Id && (!m.IsAbsent || m.TheoryMarksObtained != null), cancellationToken);

        var dto = new ExamSubjectDto(
            existingSubject.Id,
            existingSubject.ExamId,
            existingSubject.SubjectId,
            subject.Code,
            subject.Name,
            existingSubject.ProgramId,
            program.Name,
            existingSubject.ExamDate,
            existingSubject.StartTime,
            existingSubject.EndTime,
            existingSubject.MaxTheoryMarks,
            existingSubject.MaxPracticalMarks,
            existingSubject.TotalMaxMarks,
            existingSubject.PassingMarks,
            evaluatedCount);

        return Result.Success(dto);
    }
}

public record PublishExamCommand(Guid ExamId) : IRequest<Result<bool>>;

public class PublishExamCommandHandler : IRequestHandler<PublishExamCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;

    public PublishExamCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(PublishExamCommand request, CancellationToken cancellationToken)
    {
        var exam = await _context.Exams.FindAsync(new object[] { request.ExamId }, cancellationToken);
        if (exam == null)
        {
            return Result.Failure<bool>(Error.NotFound("Exam.NotFound", "Exam not found."));
        }

        exam.IsPublished = true;
        exam.Status = ExamStatus.Completed;

        var reportCards = await _context.ReportCards.Where(r => r.ExamId == request.ExamId).ToListAsync(cancellationToken);
        foreach (var rc in reportCards)
        {
            rc.IsPublished = true;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success(true);
    }
}

// --- Queries ---
public record GetExamsQuery(
    Guid OrganizationId,
    Guid? AcademicYearId = null,
    Guid? CampusId = null,
    ExamStatus? Status = null) : IRequest<Result<IReadOnlyList<ExamDto>>>;

public class GetExamsQueryHandler : IRequestHandler<GetExamsQuery, Result<IReadOnlyList<ExamDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetExamsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<ExamDto>>> Handle(GetExamsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Exams
            .AsNoTracking()
            .Include(e => e.AcademicYear)
            .Include(e => e.AcademicPeriod)
            .Include(e => e.ExamType)
            .Include(e => e.ExamSubjects)
            .Where(e => e.OrganizationId == request.OrganizationId);

        if (request.AcademicYearId.HasValue)
        {
            query = query.Where(e => e.AcademicYearId == request.AcademicYearId.Value);
        }

        if (request.CampusId.HasValue)
        {
            query = query.Where(e => e.CampusId == null || e.CampusId == request.CampusId.Value);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(e => e.Status == request.Status.Value);
        }

        var exams = await query
            .OrderByDescending(e => e.StartDate)
            .Select(e => new ExamDto(
                e.Id,
                e.OrganizationId,
                e.CampusId,
                e.AcademicYearId,
                e.AcademicYear.Name,
                e.AcademicPeriodId,
                e.AcademicPeriod != null ? e.AcademicPeriod.Name : null,
                e.ExamTypeId,
                e.ExamType.Name,
                e.GradingScaleId,
                e.Code,
                e.Name,
                e.StartDate,
                e.EndDate,
                e.Status,
                e.IsPublished,
                e.ExamSubjects.Count,
                e.CreatedAtUtc))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<ExamDto>>(exams);
    }
}

public record GetExamByIdQuery(Guid ExamId) : IRequest<Result<ExamDetailDto>>;

public class GetExamByIdQueryHandler : IRequestHandler<GetExamByIdQuery, Result<ExamDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public GetExamByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ExamDetailDto>> Handle(GetExamByIdQuery request, CancellationToken cancellationToken)
    {
        var exam = await _context.Exams
            .AsNoTracking()
            .Include(e => e.AcademicYear)
            .Include(e => e.AcademicPeriod)
            .Include(e => e.ExamType)
            .Include(e => e.ExamSubjects)
                .ThenInclude(s => s.Subject)
            .Include(e => e.ExamSubjects)
                .ThenInclude(s => s.Program)
            .Include(e => e.ExamSubjects)
                .ThenInclude(s => s.MarksEntries)
            .FirstOrDefaultAsync(e => e.Id == request.ExamId, cancellationToken);

        if (exam == null)
        {
            return Result.Failure<ExamDetailDto>(Error.NotFound("Exam.NotFound", "Exam not found."));
        }

        var subjectDtos = exam.ExamSubjects
            .OrderBy(s => s.ExamDate)
            .ThenBy(s => s.StartTime)
            .Select(s => new ExamSubjectDto(
                s.Id,
                s.ExamId,
                s.SubjectId,
                s.Subject.Code,
                s.Subject.Name,
                s.ProgramId,
                s.Program.Name,
                s.ExamDate,
                s.StartTime,
                s.EndTime,
                s.MaxTheoryMarks,
                s.MaxPracticalMarks,
                s.TotalMaxMarks,
                s.PassingMarks,
                s.MarksEntries.Count(m => !m.IsAbsent || m.TheoryMarksObtained != null)))
            .ToList();

        var detailDto = new ExamDetailDto(
            exam.Id,
            exam.OrganizationId,
            exam.CampusId,
            exam.AcademicYearId,
            exam.AcademicYear.Name,
            exam.AcademicPeriodId,
            exam.AcademicPeriod?.Name,
            exam.ExamTypeId,
            exam.ExamType.Name,
            exam.GradingScaleId,
            exam.Code,
            exam.Name,
            exam.StartDate,
            exam.EndDate,
            exam.Status,
            exam.IsPublished,
            subjectDtos,
            exam.CreatedAtUtc);

        return Result.Success(detailDto);
    }
}
