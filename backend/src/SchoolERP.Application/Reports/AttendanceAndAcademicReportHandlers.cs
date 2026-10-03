using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Attendance;
using SchoolERP.Contracts.Examinations;
using SchoolERP.Contracts.Reports;

namespace SchoolERP.Application.Reports;

// =========================================================================
// ATTENDANCE REPORT
// =========================================================================

public record GetAttendanceReportQuery(
    Guid OrganizationId,
    DateOnly FromDate,
    DateOnly ToDate,
    Guid? SectionId = null,
    Guid? CampusId = null) : IRequest<Result<AttendanceReportDto>>;

public class GetAttendanceReportQueryHandler : IRequestHandler<GetAttendanceReportQuery, Result<AttendanceReportDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAttendanceReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AttendanceReportDto>> Handle(GetAttendanceReportQuery request, CancellationToken cancellationToken)
    {
        var sessionQuery = _context.AttendanceSessions.AsNoTracking()
            .Include(s => s.Section)
            .Include(s => s.Records)
                .ThenInclude(r => r.Student)
            .Where(s => s.OrganizationId == request.OrganizationId &&
                        s.Date >= request.FromDate &&
                        s.Date <= request.ToDate);

        if (request.CampusId.HasValue)
        {
            sessionQuery = sessionQuery.Where(s => s.CampusId == request.CampusId.Value);
        }

        if (request.SectionId.HasValue)
        {
            sessionQuery = sessionQuery.Where(s => s.SectionId == request.SectionId.Value);
        }

        var sessions = await sessionQuery.ToListAsync(cancellationToken);

        var allRecords = sessions.SelectMany(s => s.Records.Select(r => new { Record = r, Session = s })).ToList();

        var total = allRecords.Count;
        var present = allRecords.Count(x => x.Record.Status == AttendanceStatus.Present);
        var absent = allRecords.Count(x => x.Record.Status == AttendanceStatus.Absent);
        var late = allRecords.Count(x => x.Record.Status == AttendanceStatus.Late);
        var halfDay = allRecords.Count(x => x.Record.Status == AttendanceStatus.HalfDay);
        var excused = allRecords.Count(x => x.Record.Status == AttendanceStatus.Excused);
        var onLeave = allRecords.Count(x => x.Record.Status == AttendanceStatus.OnLeave);

        var attendedCount = present + late + halfDay + excused + onLeave;
        var overallPercentage = total > 0
            ? Math.Round(((decimal)attendedCount / total) * 100, 2)
            : 0;

        var dailyTrends = allRecords
            .GroupBy(x => x.Session.Date)
            .Select(g =>
            {
                var dayTotal = g.Count();
                var dayPresent = g.Count(x => x.Record.Status == AttendanceStatus.Present || x.Record.Status == AttendanceStatus.Late || x.Record.Status == AttendanceStatus.HalfDay);
                var dayAbsent = g.Count(x => x.Record.Status == AttendanceStatus.Absent);
                var pct = dayTotal > 0 ? Math.Round(((decimal)dayPresent / dayTotal) * 100, 2) : 0;
                return new DailyAttendanceTrendDto(g.Key, dayTotal, dayPresent, dayAbsent, pct);
            })
            .OrderBy(d => d.Date)
            .ToList();

        var sectionBreakdown = allRecords
            .GroupBy(x => x.Session.Section != null ? x.Session.Section.Name : "Unassigned Section")
            .Select(g =>
            {
                var sTotal = g.Count();
                var sPresent = g.Count(x => x.Record.Status == AttendanceStatus.Present || x.Record.Status == AttendanceStatus.Late || x.Record.Status == AttendanceStatus.HalfDay);
                var sAbsent = g.Count(x => x.Record.Status == AttendanceStatus.Absent);
                var pct = sTotal > 0 ? Math.Round(((decimal)sPresent / sTotal) * 100, 2) : 0;
                return new SectionAttendanceSummaryDto(g.Key, sTotal, sPresent, sAbsent, pct);
            })
            .OrderBy(s => s.SectionName)
            .ToList();

        var dto = new AttendanceReportDto(
            request.FromDate,
            request.ToDate,
            total,
            present,
            absent,
            late,
            halfDay,
            excused,
            onLeave,
            overallPercentage,
            dailyTrends,
            sectionBreakdown);

        return Result.Success(dto);
    }
}

// =========================================================================
// EXAM RESULT REPORT
// =========================================================================

public record GetExamResultReportQuery(
    Guid OrganizationId,
    Guid ExamId,
    Guid? SectionId = null,
    Guid? CampusId = null) : IRequest<Result<ExamResultReportDto>>;

public class GetExamResultReportQueryHandler : IRequestHandler<GetExamResultReportQuery, Result<ExamResultReportDto>>
{
    private readonly IApplicationDbContext _context;

    public GetExamResultReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ExamResultReportDto>> Handle(GetExamResultReportQuery request, CancellationToken cancellationToken)
    {
        var exam = await _context.Exams.AsNoTracking()
            .Include(e => e.AcademicYear)
            .FirstOrDefaultAsync(e => e.Id == request.ExamId && e.OrganizationId == request.OrganizationId, cancellationToken);

        if (exam == null)
        {
            return Result.Failure<ExamResultReportDto>(Error.NotFound("Exam.NotFound", "Exam not found."));
        }

        var resultsQuery = _context.ExamResults.AsNoTracking()
            .Include(r => r.Student)
            .Include(r => r.Section)
            .Where(r => r.ExamId == request.ExamId && r.OrganizationId == request.OrganizationId);

        if (request.SectionId.HasValue)
        {
            resultsQuery = resultsQuery.Where(r => r.SectionId == request.SectionId.Value);
        }

        if (request.CampusId.HasValue)
        {
            resultsQuery = resultsQuery.Where(r => r.CampusId == request.CampusId.Value);
        }

        var results = await resultsQuery.ToListAsync(cancellationToken);

        var totalAppeared = results.Count;
        var passed = results.Count(r => r.Status == ResultStatus.Pass);
        var failed = results.Count(r => r.Status == ResultStatus.Fail);
        var passPct = totalAppeared > 0 ? Math.Round(((decimal)passed / totalAppeared) * 100, 2) : 0;
        var avgMarks = totalAppeared > 0 ? Math.Round(results.Average(r => r.Percentage), 2) : 0;

        var gradeDistribution = results
            .GroupBy(r => !string.IsNullOrWhiteSpace(r.OverallGrade) ? r.OverallGrade : "Ungraded")
            .Select(g => new GradeDistributionDto(
                g.Key,
                g.Count(),
                totalAppeared > 0 ? Math.Round(((decimal)g.Count() / totalAppeared) * 100, 2) : 0))
            .OrderByDescending(g => g.StudentCount)
            .ToList();

        // Subject Performances from MarksEntries
        var marksQuery = _context.MarksEntries.AsNoTracking()
            .Include(m => m.ExamSubject)
                .ThenInclude(es => es.Subject)
            .Where(m => m.ExamSubject.ExamId == request.ExamId);

        var allMarks = await marksQuery.ToListAsync(cancellationToken);

        var subjectPerformances = allMarks
            .GroupBy(m => new
            {
                SubjectId = m.ExamSubject != null ? m.ExamSubject.SubjectId : Guid.Empty,
                SubjectCode = m.ExamSubject?.Subject?.Code ?? "N/A",
                SubjectName = m.ExamSubject?.Subject?.Name ?? "Subject"
            })
            .Select(g =>
            {
                var sTotal = g.Count();
                var sPassed = g.Count(m => !m.IsAbsent && m.TotalMarksObtained >= (m.ExamSubject?.PassingMarks ?? 0));
                var sAvg = sTotal > 0 ? Math.Round(g.Average(m => m.TotalMarksObtained), 2) : 0;
                var sHigh = sTotal > 0 ? g.Max(m => m.TotalMarksObtained) : 0;
                var sLow = sTotal > 0 ? g.Min(m => m.TotalMarksObtained) : 0;
                var sPassPct = sTotal > 0 ? Math.Round(((decimal)sPassed / sTotal) * 100, 2) : 0;

                return new SubjectPerformanceDto(
                    g.Key.SubjectId,
                    g.Key.SubjectCode,
                    g.Key.SubjectName,
                    sAvg,
                    sHigh,
                    sLow,
                    sPassPct);
            })
            .OrderBy(s => s.SubjectName)
            .ToList();

        // Top 10 Performers
        var topPerformers = results
            .OrderByDescending(r => r.Percentage)
            .Take(10)
            .Select((r, index) => new TopPerformerDto(
                index + 1,
                r.StudentId,
                r.Student?.AdmissionNumber ?? string.Empty,
                r.Student?.FullName ?? string.Empty,
                r.TotalMarksObtained,
                r.Percentage,
                r.OverallGrade ?? string.Empty))
            .ToList();

        var dto = new ExamResultReportDto(
            exam.Id,
            exam.Name,
            exam.AcademicYear?.Name,
            totalAppeared,
            passed,
            failed,
            passPct,
            avgMarks,
            gradeDistribution,
            subjectPerformances,
            topPerformers);

        return Result.Success(dto);
    }
}
