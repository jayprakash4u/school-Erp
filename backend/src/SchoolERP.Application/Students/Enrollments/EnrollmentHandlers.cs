using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Students;

namespace SchoolERP.Application.Students.Enrollments;

// --- Commands ---
public record CreateEnrollmentCommand(
    Guid StudentId,
    Guid AcademicYearId,
    Guid ProgramId,
    Guid? SectionId = null,
    Guid? StreamId = null,
    Guid? BatchId = null,
    Guid? AcademicPeriodId = null,
    string? RollNumber = null,
    DateOnly? EnrollmentDate = null,
    string? Remarks = null) : IRequest<Result<EnrollmentDto>>;

public class CreateEnrollmentCommandValidator : AbstractValidator<CreateEnrollmentCommand>
{
    public CreateEnrollmentCommandValidator()
    {
        RuleFor(x => x.StudentId).NotEmpty();
        RuleFor(x => x.AcademicYearId).NotEmpty();
        RuleFor(x => x.ProgramId).NotEmpty();
    }
}

public class CreateEnrollmentCommandHandler : IRequestHandler<CreateEnrollmentCommand, Result<EnrollmentDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateEnrollmentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<EnrollmentDto>> Handle(CreateEnrollmentCommand request, CancellationToken cancellationToken)
    {
        var student = await _context.Students.FindAsync(new object[] { request.StudentId }, cancellationToken);
        if (student == null)
        {
            return Result.Failure<EnrollmentDto>(Error.NotFound("Student.NotFound", "Student not found."));
        }

        var year = await _context.AcademicYears.FindAsync(new object[] { request.AcademicYearId }, cancellationToken);
        if (year == null)
        {
            return Result.Failure<EnrollmentDto>(Error.NotFound("AcademicYear.NotFound", "Academic year not found."));
        }

        var program = await _context.Programs.FindAsync(new object[] { request.ProgramId }, cancellationToken);
        if (program == null)
        {
            return Result.Failure<EnrollmentDto>(Error.NotFound("Program.NotFound", "Program/Grade not found."));
        }

        var enrollmentDate = request.EnrollmentDate ?? DateOnly.FromDateTime(DateTime.UtcNow);

        var enrollment = new Enrollment(
            request.StudentId,
            request.AcademicYearId,
            request.ProgramId,
            enrollmentDate,
            request.SectionId,
            request.StreamId,
            request.BatchId,
            request.AcademicPeriodId,
            request.RollNumber,
            EnrollmentStatus.Active)
        {
            Remarks = request.Remarks
        };

        _context.Enrollments.Add(enrollment);
        await _context.SaveChangesAsync(cancellationToken);

        string? streamName = null;
        if (request.StreamId.HasValue)
        {
            var stream = await _context.Streams.FindAsync(new object[] { request.StreamId.Value }, cancellationToken);
            streamName = stream?.Name;
        }

        string? batchName = null;
        if (request.BatchId.HasValue)
        {
            var batch = await _context.Batches.FindAsync(new object[] { request.BatchId.Value }, cancellationToken);
            batchName = batch?.Name;
        }

        string? sectionName = null;
        if (request.SectionId.HasValue)
        {
            var section = await _context.Sections.FindAsync(new object[] { request.SectionId.Value }, cancellationToken);
            sectionName = section?.Name;
        }

        string? periodName = null;
        if (request.AcademicPeriodId.HasValue)
        {
            var period = await _context.AcademicPeriods.FindAsync(new object[] { request.AcademicPeriodId.Value }, cancellationToken);
            periodName = period?.Name;
        }

        var dto = new EnrollmentDto(
            enrollment.Id,
            enrollment.StudentId,
            enrollment.AcademicYearId,
            year.Name,
            enrollment.ProgramId,
            program.Name,
            enrollment.StreamId,
            streamName,
            enrollment.BatchId,
            batchName,
            enrollment.SectionId,
            sectionName,
            enrollment.AcademicPeriodId,
            periodName,
            enrollment.RollNumber,
            enrollment.EnrollmentDate,
            enrollment.Status,
            enrollment.CompletionDate,
            enrollment.Remarks);

        return Result.Success(dto);
    }
}

public record PromoteStudentCommand(
    Guid StudentId,
    PromoteStudentRequest Request) : IRequest<Result<EnrollmentDto>>;

public class PromoteStudentCommandHandler : IRequestHandler<PromoteStudentCommand, Result<EnrollmentDto>>
{
    private readonly IApplicationDbContext _context;

    public PromoteStudentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<EnrollmentDto>> Handle(PromoteStudentCommand command, CancellationToken cancellationToken)
    {
        var studentExists = await _context.Students.AnyAsync(s => s.Id == command.StudentId, cancellationToken);
        if (!studentExists)
        {
            return Result.Failure<EnrollmentDto>(Error.NotFound("Student.NotFound", "Student not found."));
        }

        var req = command.Request;

        // Mark current active enrollment(s) as Promoted / Completed
        var activeEnrollments = await _context.Enrollments
            .Where(e => e.StudentId == command.StudentId && e.Status == EnrollmentStatus.Active)
            .ToListAsync(cancellationToken);

        foreach (var active in activeEnrollments)
        {
            active.Status = req.PreviousEnrollmentStatus;
            active.CompletionDate = DateOnly.FromDateTime(DateTime.UtcNow);
        }

        var targetYear = await _context.AcademicYears.FindAsync(new object[] { req.TargetAcademicYearId }, cancellationToken);
        if (targetYear == null)
        {
            return Result.Failure<EnrollmentDto>(Error.NotFound("AcademicYear.NotFound", "Target academic year not found."));
        }

        var targetProgram = await _context.Programs.FindAsync(new object[] { req.TargetProgramId }, cancellationToken);
        if (targetProgram == null)
        {
            return Result.Failure<EnrollmentDto>(Error.NotFound("Program.NotFound", "Target program/grade not found."));
        }

        var newEnrollment = new Enrollment(
            command.StudentId,
            req.TargetAcademicYearId,
            req.TargetProgramId,
            DateOnly.FromDateTime(DateTime.UtcNow),
            req.TargetSectionId,
            req.TargetStreamId,
            req.TargetBatchId,
            req.TargetAcademicPeriodId,
            req.NewRollNumber,
            EnrollmentStatus.Active)
        {
            Remarks = req.Remarks ?? "Promoted to next grade"
        };

        _context.Enrollments.Add(newEnrollment);
        await _context.SaveChangesAsync(cancellationToken);

        string? sectionName = null;
        if (req.TargetSectionId.HasValue)
        {
            var sec = await _context.Sections.FindAsync(new object[] { req.TargetSectionId.Value }, cancellationToken);
            sectionName = sec?.Name;
        }

        var dto = new EnrollmentDto(
            newEnrollment.Id,
            newEnrollment.StudentId,
            newEnrollment.AcademicYearId,
            targetYear.Name,
            newEnrollment.ProgramId,
            targetProgram.Name,
            newEnrollment.StreamId,
            null,
            newEnrollment.BatchId,
            null,
            newEnrollment.SectionId,
            sectionName,
            newEnrollment.AcademicPeriodId,
            null,
            newEnrollment.RollNumber,
            newEnrollment.EnrollmentDate,
            newEnrollment.Status,
            newEnrollment.CompletionDate,
            newEnrollment.Remarks);

        return Result.Success(dto);
    }
}

// --- Queries ---
public record GetStudentEnrollmentsQuery(Guid StudentId) : IRequest<Result<IReadOnlyList<EnrollmentDto>>>;

public class GetStudentEnrollmentsQueryHandler : IRequestHandler<GetStudentEnrollmentsQuery, Result<IReadOnlyList<EnrollmentDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetStudentEnrollmentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<EnrollmentDto>>> Handle(GetStudentEnrollmentsQuery request, CancellationToken cancellationToken)
    {
        var enrollments = await _context.Enrollments
            .AsNoTracking()
            .Where(e => e.StudentId == request.StudentId)
            .OrderByDescending(e => e.EnrollmentDate)
            .Select(e => new EnrollmentDto(
                e.Id,
                e.StudentId,
                e.AcademicYearId,
                e.AcademicYear.Name,
                e.ProgramId,
                e.Program.Name,
                e.StreamId,
                e.Stream != null ? e.Stream.Name : null,
                e.BatchId,
                e.Batch != null ? e.Batch.Name : null,
                e.SectionId,
                e.Section != null ? e.Section.Name : null,
                e.AcademicPeriodId,
                e.AcademicPeriod != null ? e.AcademicPeriod.Name : null,
                e.RollNumber,
                e.EnrollmentDate,
                e.Status,
                e.CompletionDate,
                e.Remarks))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<EnrollmentDto>>(enrollments);
    }
}
