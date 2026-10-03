using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Reports;
using SchoolERP.Contracts.Staff;
using SchoolERP.Contracts.Students;

namespace SchoolERP.Application.Reports;

// =========================================================================
// STUDENT REPORT
// =========================================================================

public record GetStudentReportQuery(
    Guid OrganizationId,
    Guid? CampusId = null) : IRequest<Result<StudentReportDto>>;

public class GetStudentReportQueryHandler : IRequestHandler<GetStudentReportQuery, Result<StudentReportDto>>
{
    private readonly IApplicationDbContext _context;

    public GetStudentReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<StudentReportDto>> Handle(GetStudentReportQuery request, CancellationToken cancellationToken)
    {
        var studentQuery = _context.Students.AsNoTracking()
            .Where(s => s.OrganizationId == request.OrganizationId);

        if (request.CampusId.HasValue)
        {
            studentQuery = studentQuery.Where(s => s.CampusId == request.CampusId.Value);
        }

        var students = await studentQuery.ToListAsync(cancellationToken);

        var total = students.Count;
        var active = students.Count(s => s.Status == StudentStatus.Active);
        var inactive = students.Count(s => s.Status == StudentStatus.Inactive);
        var graduated = students.Count(s => s.Status == StudentStatus.Graduated);

        var male = students.Count(s => s.Gender == Gender.Male);
        var female = students.Count(s => s.Gender == Gender.Female);
        var other = students.Count(s => s.Gender == Gender.Other);

        // Active enrollments for Program & Section summaries
        var enrollmentQuery = _context.Enrollments.AsNoTracking()
            .Include(e => e.Program)
            .Include(e => e.Section)
            .Include(e => e.Student)
            .Where(e => e.Student.OrganizationId == request.OrganizationId && e.Status == EnrollmentStatus.Active);

        if (request.CampusId.HasValue)
        {
            enrollmentQuery = enrollmentQuery.Where(e => e.Student.CampusId == request.CampusId.Value);
        }

        var enrollments = await enrollmentQuery.ToListAsync(cancellationToken);

        var programSummaries = enrollments
            .GroupBy(e => new { e.ProgramId, ProgramName = e.Program != null ? e.Program.Name : "Unknown Program" })
            .Select(g => new ProgramEnrollmentSummaryDto(
                g.Key.ProgramId,
                g.Key.ProgramName,
                g.Count(),
                g.Count(e => e.Student?.Gender == Gender.Male),
                g.Count(e => e.Student?.Gender == Gender.Female)))
            .OrderBy(p => p.ProgramName)
            .ToList();

        var sectionSummaries = enrollments
            .GroupBy(e => new { e.SectionId, SectionName = e.Section != null ? e.Section.Name : "Unassigned Section" })
            .Select(g => new SectionEnrollmentSummaryDto(
                g.Key.SectionId,
                g.Key.SectionName,
                g.Count(),
                g.Count(e => e.Student?.Gender == Gender.Male),
                g.Count(e => e.Student?.Gender == Gender.Female)))
            .OrderBy(s => s.SectionName)
            .ToList();

        var dto = new StudentReportDto(
            total,
            active,
            inactive,
            graduated,
            male,
            female,
            other,
            programSummaries,
            sectionSummaries);

        return Result.Success(dto);
    }
}

// =========================================================================
// STAFF REPORT
// =========================================================================

public record GetStaffReportQuery(
    Guid OrganizationId,
    Guid? CampusId = null) : IRequest<Result<StaffReportDto>>;

public class GetStaffReportQueryHandler : IRequestHandler<GetStaffReportQuery, Result<StaffReportDto>>
{
    private readonly IApplicationDbContext _context;

    public GetStaffReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<StaffReportDto>> Handle(GetStaffReportQuery request, CancellationToken cancellationToken)
    {
        var staffQuery = _context.Staff.AsNoTracking()
            .Include(s => s.Department)
            .Include(s => s.Designation)
            .Where(s => s.OrganizationId == request.OrganizationId);

        if (request.CampusId.HasValue)
        {
            staffQuery = staffQuery.Where(s => s.CampusId == request.CampusId.Value);
        }

        var staffList = await staffQuery.ToListAsync(cancellationToken);

        var total = staffList.Count;
        var teaching = staffList.Count(s => s.StaffType == StaffType.Teaching);
        var nonTeaching = staffList.Count(s => s.StaffType == StaffType.NonTeaching);
        var active = staffList.Count(s => s.Status == StaffStatus.Active);

        var departmentSummaries = staffList
            .GroupBy(s => new { s.DepartmentId, DepartmentName = s.Department != null ? s.Department.Name : "Unassigned" })
            .Select(g => new DepartmentStaffSummaryDto(
                g.Key.DepartmentId,
                g.Key.DepartmentName,
                g.Count(),
                g.Count(s => s.StaffType == StaffType.Teaching),
                g.Count(s => s.StaffType == StaffType.NonTeaching)))
            .OrderBy(d => d.DepartmentName)
            .ToList();

        var designationSummaries = staffList
            .GroupBy(s => new { s.DesignationId, DesignationTitle = s.Designation != null ? s.Designation.Title : "Unassigned" })
            .Select(g => new DesignationStaffSummaryDto(
                g.Key.DesignationId,
                g.Key.DesignationTitle,
                g.Count()))
            .OrderBy(d => d.DesignationTitle)
            .ToList();

        var dto = new StaffReportDto(
            total,
            teaching,
            nonTeaching,
            active,
            departmentSummaries,
            designationSummaries);

        return Result.Success(dto);
    }
}
