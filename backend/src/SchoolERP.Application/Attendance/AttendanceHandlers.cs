using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Attendance;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Attendance;

namespace SchoolERP.Application.Attendance;

// --- Commands ---
public record TakeAttendanceCommand(
    Guid OrganizationId,
    Guid AcademicYearId,
    Guid ProgramId,
    Guid SectionId,
    DateOnly Date,
    IReadOnlyList<StudentAttendanceEntry> Entries,
    Guid? SubjectId = null,
    AttendanceType Type = AttendanceType.Daily,
    Guid? TakenByStaffId = null,
    string? Remarks = null,
    Guid? CampusId = null) : IRequest<Result<AttendanceSessionDto>>;

public class TakeAttendanceCommandValidator : AbstractValidator<TakeAttendanceCommand>
{
    public TakeAttendanceCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.AcademicYearId).NotEmpty();
        RuleFor(x => x.ProgramId).NotEmpty();
        RuleFor(x => x.SectionId).NotEmpty();
        RuleFor(x => x.Date).NotEmpty();
        RuleFor(x => x.Entries).NotEmpty();
    }
}

public class TakeAttendanceCommandHandler : IRequestHandler<TakeAttendanceCommand, Result<AttendanceSessionDto>>
{
    private readonly IApplicationDbContext _context;

    public TakeAttendanceCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AttendanceSessionDto>> Handle(TakeAttendanceCommand request, CancellationToken cancellationToken)
    {
        var year = await _context.AcademicYears.FindAsync(new object[] { request.AcademicYearId }, cancellationToken);
        if (year == null)
        {
            return Result.Failure<AttendanceSessionDto>(Error.NotFound("AcademicYear.NotFound", "Academic year not found."));
        }

        var program = await _context.Programs.FindAsync(new object[] { request.ProgramId }, cancellationToken);
        if (program == null)
        {
            return Result.Failure<AttendanceSessionDto>(Error.NotFound("Program.NotFound", "Program/Grade not found."));
        }

        var section = await _context.Sections.FindAsync(new object[] { request.SectionId }, cancellationToken);
        if (section == null)
        {
            return Result.Failure<AttendanceSessionDto>(Error.NotFound("Section.NotFound", "Section not found."));
        }

        // Find existing session on that date for that section or create a new one
        var session = await _context.AttendanceSessions
            .Include(s => s.Records)
            .FirstOrDefaultAsync(s => s.OrganizationId == request.OrganizationId &&
                                      s.SectionId == request.SectionId &&
                                      s.Date == request.Date &&
                                      s.Type == request.Type &&
                                      s.SubjectId == request.SubjectId, cancellationToken);

        if (session == null)
        {
            session = new AttendanceSession(
                request.OrganizationId,
                request.AcademicYearId,
                request.ProgramId,
                request.SectionId,
                request.Date,
                request.Type,
                request.SubjectId,
                request.TakenByStaffId,
                request.CampusId)
            {
                Remarks = request.Remarks,
                Status = AttendanceSessionStatus.Submitted
            };
            _context.AttendanceSessions.Add(session);
        }
        else
        {
            session.TakenByStaffId = request.TakenByStaffId ?? session.TakenByStaffId;
            session.Remarks = request.Remarks ?? session.Remarks;
            session.Status = AttendanceSessionStatus.Submitted;
        }

        // Map entries to records
        foreach (var entry in request.Entries)
        {
            var existingRecord = session.Records.FirstOrDefault(r => r.StudentId == entry.StudentId);
            if (existingRecord == null)
            {
                var record = new AttendanceRecord(
                    session.Id,
                    entry.StudentId,
                    entry.Status,
                    null,
                    entry.LateMinutes,
                    entry.Remarks);
                session.Records.Add(record);
            }
            else
            {
                existingRecord.Status = entry.Status;
                existingRecord.LateMinutes = entry.LateMinutes;
                existingRecord.Remarks = entry.Remarks;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Update/Recalculate Attendance Summaries for each student
        foreach (var entry in request.Entries)
        {
            await RecalculateSummaryAsync(request.OrganizationId, entry.StudentId, request.AcademicYearId, request.ProgramId, request.SectionId, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);

        var presentCount = session.Records.Count(r => r.Status == AttendanceStatus.Present);
        var absentCount = session.Records.Count(r => r.Status == AttendanceStatus.Absent);
        var lateCount = session.Records.Count(r => r.Status == AttendanceStatus.Late);
        var excusedCount = session.Records.Count(r => r.Status == AttendanceStatus.Excused);

        string? staffName = null;
        if (session.TakenByStaffId.HasValue)
        {
            var staff = await _context.Staff.FindAsync(new object[] { session.TakenByStaffId.Value }, cancellationToken);
            staffName = staff?.FullName;
        }

        string? subjectName = null;
        if (session.SubjectId.HasValue)
        {
            var sub = await _context.Subjects.FindAsync(new object[] { session.SubjectId.Value }, cancellationToken);
            subjectName = sub?.Name;
        }

        var dto = new AttendanceSessionDto(
            session.Id,
            session.OrganizationId,
            session.CampusId,
            session.AcademicYearId,
            year.Name,
            session.ProgramId,
            program.Name,
            session.SectionId,
            section.Name,
            session.SubjectId,
            subjectName,
            session.Date,
            session.Type,
            session.Status,
            session.TakenByStaffId,
            staffName,
            session.Records.Count,
            presentCount,
            absentCount,
            lateCount,
            excusedCount,
            session.Remarks,
            session.CreatedAtUtc);

        return Result.Success(dto);
    }

    private async Task RecalculateSummaryAsync(Guid orgId, Guid studentId, Guid yearId, Guid programId, Guid sectionId, CancellationToken cancellationToken)
    {
        var summary = await _context.AttendanceSummaries
            .FirstOrDefaultAsync(s => s.StudentId == studentId && s.AcademicYearId == yearId && s.SectionId == sectionId, cancellationToken);

        if (summary == null)
        {
            summary = new AttendanceSummary(orgId, studentId, yearId, programId, sectionId);
            _context.AttendanceSummaries.Add(summary);
        }

        var records = await _context.AttendanceRecords
            .AsNoTracking()
            .Include(r => r.AttendanceSession)
            .Where(r => r.StudentId == studentId &&
                        r.AttendanceSession.AcademicYearId == yearId &&
                        r.AttendanceSession.SectionId == sectionId &&
                        r.AttendanceSession.Type == AttendanceType.Daily)
            .ToListAsync(cancellationToken);

        summary.TotalWorkingDays = records.Count;
        summary.PresentDays = records.Count(r => r.Status == AttendanceStatus.Present);
        summary.AbsentDays = records.Count(r => r.Status == AttendanceStatus.Absent);
        summary.LateDays = records.Count(r => r.Status == AttendanceStatus.Late);
        summary.HalfDays = records.Count(r => r.Status == AttendanceStatus.HalfDay);
        summary.ExcusedDays = records.Count(r => r.Status == AttendanceStatus.Excused || r.Status == AttendanceStatus.OnLeave);
    }
}

// --- Queries ---
public record GetSectionAttendanceRosterQuery(
    Guid SectionId,
    DateOnly Date,
    Guid? SubjectId = null,
    AttendanceType Type = AttendanceType.Daily) : IRequest<Result<SectionAttendanceRosterDto>>;

public class GetSectionAttendanceRosterQueryHandler : IRequestHandler<GetSectionAttendanceRosterQuery, Result<SectionAttendanceRosterDto>>
{
    private readonly IApplicationDbContext _context;

    public GetSectionAttendanceRosterQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SectionAttendanceRosterDto>> Handle(GetSectionAttendanceRosterQuery request, CancellationToken cancellationToken)
    {
        var section = await _context.Sections
            .Include(s => s.Program)
            .Include(s => s.AcademicYear)
            .FirstOrDefaultAsync(s => s.Id == request.SectionId, cancellationToken);

        if (section == null)
        {
            return Result.Failure<SectionAttendanceRosterDto>(Error.NotFound("Section.NotFound", "Section not found."));
        }

        // Get existing session if attendance was already taken on that date
        var session = await _context.AttendanceSessions
            .Include(s => s.Records)
            .FirstOrDefaultAsync(s => s.SectionId == request.SectionId &&
                                      s.Date == request.Date &&
                                      s.Type == request.Type &&
                                      s.SubjectId == request.SubjectId, cancellationToken);

        // Get active enrollments for this section and academic year
        var enrolledStudents = await _context.Enrollments
            .AsNoTracking()
            .Include(e => e.Student)
            .Where(e => e.SectionId == request.SectionId &&
                        e.AcademicYearId == section.AcademicYearId &&
                        e.Status == EnrollmentStatus.Active &&
                        e.Student.Status == StudentStatus.Active)
            .OrderBy(e => e.RollNumber)
            .ThenBy(e => e.Student.FirstName)
            .ToListAsync(cancellationToken);

        var studentDtos = enrolledStudents.Select(e =>
        {
            var record = session?.Records.FirstOrDefault(r => r.StudentId == e.StudentId);
            return new SectionRosterStudentDto(
                e.StudentId,
                e.Student.FullName,
                e.Student.AdmissionNumber,
                e.RollNumber,
                record?.Status,
                record?.LateMinutes,
                record?.Remarks);
        }).ToList();

        var roster = new SectionAttendanceRosterDto(
            section.Id,
            section.Name,
            section.ProgramId,
            section.Program.Name,
            section.AcademicYearId,
            section.AcademicYear.Name,
            request.Date,
            session?.Id,
            session?.Status,
            studentDtos);

        return Result.Success(roster);
    }
}

public record GetStudentAttendanceQuery(
    Guid StudentId,
    DateOnly? StartDate = null,
    DateOnly? EndDate = null,
    Guid? AcademicYearId = null) : IRequest<Result<IReadOnlyList<StudentDailyAttendanceDto>>>;

public class GetStudentAttendanceQueryHandler : IRequestHandler<GetStudentAttendanceQuery, Result<IReadOnlyList<StudentDailyAttendanceDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetStudentAttendanceQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<StudentDailyAttendanceDto>>> Handle(GetStudentAttendanceQuery request, CancellationToken cancellationToken)
    {
        var query = _context.AttendanceRecords
            .AsNoTracking()
            .Include(r => r.AttendanceSession)
                .ThenInclude(s => s.Program)
            .Include(r => r.AttendanceSession)
                .ThenInclude(s => s.Section)
            .Include(r => r.AttendanceSession)
                .ThenInclude(s => s.Subject)
            .Where(r => r.StudentId == request.StudentId);

        if (request.AcademicYearId.HasValue)
        {
            query = query.Where(r => r.AttendanceSession.AcademicYearId == request.AcademicYearId.Value);
        }

        if (request.StartDate.HasValue)
        {
            query = query.Where(r => r.AttendanceSession.Date >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            query = query.Where(r => r.AttendanceSession.Date <= request.EndDate.Value);
        }

        var list = await query
            .OrderByDescending(r => r.AttendanceSession.Date)
            .Select(r => new StudentDailyAttendanceDto(
                r.Id,
                r.AttendanceSession.Date,
                r.AttendanceSession.Program.Name,
                r.AttendanceSession.Section.Name,
                r.AttendanceSession.Subject != null ? r.AttendanceSession.Subject.Name : null,
                r.Status,
                r.LateMinutes,
                r.Remarks))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<StudentDailyAttendanceDto>>(list);
    }
}

public record GetStudentAttendanceSummaryQuery(
    Guid StudentId,
    Guid? AcademicYearId = null) : IRequest<Result<AttendanceSummaryDto>>;

public class GetStudentAttendanceSummaryQueryHandler : IRequestHandler<GetStudentAttendanceSummaryQuery, Result<AttendanceSummaryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetStudentAttendanceSummaryQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AttendanceSummaryDto>> Handle(GetStudentAttendanceSummaryQuery request, CancellationToken cancellationToken)
    {
        var student = await _context.Students.FindAsync(new object[] { request.StudentId }, cancellationToken);
        if (student == null)
        {
            return Result.Failure<AttendanceSummaryDto>(Error.NotFound("Student.NotFound", "Student not found."));
        }

        var query = _context.AttendanceSummaries
            .AsNoTracking()
            .Include(s => s.AcademicYear)
            .Include(s => s.Program)
            .Include(s => s.Section)
            .Where(s => s.StudentId == request.StudentId);

        if (request.AcademicYearId.HasValue)
        {
            query = query.Where(s => s.AcademicYearId == request.AcademicYearId.Value);
        }

        var summary = await query.OrderByDescending(s => s.CreatedAtUtc).FirstOrDefaultAsync(cancellationToken);
        if (summary == null)
        {
            return Result.Failure<AttendanceSummaryDto>(Error.NotFound("AttendanceSummary.NotFound", "No attendance summary found for this student."));
        }

        var dto = new AttendanceSummaryDto(
            summary.StudentId,
            student.FullName,
            student.AdmissionNumber,
            summary.AcademicYearId,
            summary.AcademicYear.Name,
            summary.ProgramId,
            summary.Program.Name,
            summary.SectionId,
            summary.Section.Name,
            summary.TotalWorkingDays,
            summary.PresentDays,
            summary.AbsentDays,
            summary.LateDays,
            summary.HalfDays,
            summary.ExcusedDays,
            summary.AttendancePercentage);

        return Result.Success(dto);
    }
}

// --- Corrections ---
public record RequestAttendanceCorrectionCommand(
    Guid AttendanceRecordId,
    AttendanceStatus NewStatus,
    string Reason,
    string? RequestedByUserId = null) : IRequest<Result<AttendanceCorrectionDto>>;

public class RequestAttendanceCorrectionCommandHandler : IRequestHandler<RequestAttendanceCorrectionCommand, Result<AttendanceCorrectionDto>>
{
    private readonly IApplicationDbContext _context;

    public RequestAttendanceCorrectionCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AttendanceCorrectionDto>> Handle(RequestAttendanceCorrectionCommand request, CancellationToken cancellationToken)
    {
        var record = await _context.AttendanceRecords
            .Include(r => r.Student)
            .Include(r => r.AttendanceSession)
            .FirstOrDefaultAsync(r => r.Id == request.AttendanceRecordId, cancellationToken);

        if (record == null)
        {
            return Result.Failure<AttendanceCorrectionDto>(Error.NotFound("AttendanceRecord.NotFound", "Attendance record not found."));
        }

        var correction = new AttendanceCorrection(
            record.Id,
            record.Status,
            request.NewStatus,
            request.Reason.Trim(),
            request.RequestedByUserId);

        _context.AttendanceCorrections.Add(correction);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new AttendanceCorrectionDto(
            correction.Id,
            correction.AttendanceRecordId,
            record.StudentId,
            record.Student.FullName,
            record.AttendanceSession.Date,
            correction.OldStatus,
            correction.NewStatus,
            correction.Reason,
            correction.Status,
            correction.RequestedByUserId,
            correction.ReviewedByUserId,
            correction.ReviewedAtUtc,
            correction.ReviewRemarks,
            correction.CreatedAtUtc);

        return Result.Success(dto);
    }
}

public record ProcessAttendanceCorrectionCommand(
    Guid CorrectionId,
    CorrectionRequestStatus Status,
    string? ReviewRemarks = null,
    string? ReviewedByUserId = null) : IRequest<Result<AttendanceCorrectionDto>>;

public class ProcessAttendanceCorrectionCommandHandler : IRequestHandler<ProcessAttendanceCorrectionCommand, Result<AttendanceCorrectionDto>>
{
    private readonly IApplicationDbContext _context;

    public ProcessAttendanceCorrectionCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AttendanceCorrectionDto>> Handle(ProcessAttendanceCorrectionCommand request, CancellationToken cancellationToken)
    {
        var correction = await _context.AttendanceCorrections
            .Include(c => c.AttendanceRecord)
                .ThenInclude(r => r.Student)
            .Include(c => c.AttendanceRecord)
                .ThenInclude(r => r.AttendanceSession)
            .FirstOrDefaultAsync(c => c.Id == request.CorrectionId, cancellationToken);

        if (correction == null)
        {
            return Result.Failure<AttendanceCorrectionDto>(Error.NotFound("AttendanceCorrection.NotFound", "Attendance correction request not found."));
        }

        correction.Status = request.Status;
        correction.ReviewRemarks = request.ReviewRemarks?.Trim();
        correction.ReviewedByUserId = request.ReviewedByUserId;
        correction.ReviewedAtUtc = DateTime.UtcNow;

        if (request.Status == CorrectionRequestStatus.Approved)
        {
            correction.AttendanceRecord.Status = correction.NewStatus;
        }

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new AttendanceCorrectionDto(
            correction.Id,
            correction.AttendanceRecordId,
            correction.AttendanceRecord.StudentId,
            correction.AttendanceRecord.Student.FullName,
            correction.AttendanceRecord.AttendanceSession.Date,
            correction.OldStatus,
            correction.NewStatus,
            correction.Reason,
            correction.Status,
            correction.RequestedByUserId,
            correction.ReviewedByUserId,
            correction.ReviewedAtUtc,
            correction.ReviewRemarks,
            correction.CreatedAtUtc);

        return Result.Success(dto);
    }
}
