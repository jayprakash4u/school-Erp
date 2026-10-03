using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Staff;
using SchoolERP.Domain.Entities.Staff;

namespace SchoolERP.Application.Staff.TeacherAssignments;

public record CreateTeacherAssignmentCommand(
    Guid StaffId,
    Guid SubjectId,
    Guid ProgramId,
    Guid AcademicYearId,
    Guid? SectionId = null,
    Guid? AcademicPeriodId = null,
    bool IsPrimaryTeacher = true,
    DateOnly? AssignedDate = null,
    string? Remarks = null) : IRequest<Result<TeacherAssignmentDto>>;

public class CreateTeacherAssignmentCommandValidator : AbstractValidator<CreateTeacherAssignmentCommand>
{
    public CreateTeacherAssignmentCommandValidator()
    {
        RuleFor(x => x.StaffId).NotEmpty();
        RuleFor(x => x.SubjectId).NotEmpty();
        RuleFor(x => x.ProgramId).NotEmpty();
        RuleFor(x => x.AcademicYearId).NotEmpty();
    }
}

public class CreateTeacherAssignmentCommandHandler : IRequestHandler<CreateTeacherAssignmentCommand, Result<TeacherAssignmentDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateTeacherAssignmentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<TeacherAssignmentDto>> Handle(CreateTeacherAssignmentCommand request, CancellationToken cancellationToken)
    {
        var staff = await _context.Staff.FindAsync(new object[] { request.StaffId }, cancellationToken);
        if (staff == null)
        {
            return Result.Failure<TeacherAssignmentDto>(Error.NotFound("Staff.NotFound", "Teacher/Staff not found."));
        }

        var subject = await _context.Subjects.FindAsync(new object[] { request.SubjectId }, cancellationToken);
        if (subject == null)
        {
            return Result.Failure<TeacherAssignmentDto>(Error.NotFound("Subject.NotFound", "Subject not found."));
        }

        var program = await _context.Programs.FindAsync(new object[] { request.ProgramId }, cancellationToken);
        if (program == null)
        {
            return Result.Failure<TeacherAssignmentDto>(Error.NotFound("Program.NotFound", "Program/Grade not found."));
        }

        var year = await _context.AcademicYears.FindAsync(new object[] { request.AcademicYearId }, cancellationToken);
        if (year == null)
        {
            return Result.Failure<TeacherAssignmentDto>(Error.NotFound("AcademicYear.NotFound", "Academic year not found."));
        }

        var assignment = new TeacherAssignment(
            staff.OrganizationId,
            request.StaffId,
            request.SubjectId,
            request.ProgramId,
            request.AcademicYearId,
            request.SectionId,
            request.AcademicPeriodId,
            request.IsPrimaryTeacher,
            request.AssignedDate,
            staff.CampusId)
        {
            Remarks = request.Remarks
        };

        _context.TeacherAssignments.Add(assignment);
        await _context.SaveChangesAsync(cancellationToken);

        string? sectionName = null;
        if (request.SectionId.HasValue)
        {
            var sec = await _context.Sections.FindAsync(new object[] { request.SectionId.Value }, cancellationToken);
            sectionName = sec?.Name;
        }

        string? periodName = null;
        if (request.AcademicPeriodId.HasValue)
        {
            var period = await _context.AcademicPeriods.FindAsync(new object[] { request.AcademicPeriodId.Value }, cancellationToken);
            periodName = period?.Name;
        }

        var dto = new TeacherAssignmentDto(
            assignment.Id,
            assignment.StaffId,
            staff.FullName,
            staff.EmployeeCode,
            assignment.SubjectId,
            subject.Code,
            subject.Name,
            assignment.ProgramId,
            program.Name,
            assignment.SectionId,
            sectionName,
            assignment.AcademicYearId,
            year.Name,
            assignment.AcademicPeriodId,
            periodName,
            assignment.IsPrimaryTeacher,
            assignment.AssignedDate,
            assignment.IsActive,
            assignment.Remarks);

        return Result.Success(dto);
    }
}

public record DeactivateTeacherAssignmentCommand(Guid AssignmentId) : IRequest<Result>;

public class DeactivateTeacherAssignmentCommandHandler : IRequestHandler<DeactivateTeacherAssignmentCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public DeactivateTeacherAssignmentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DeactivateTeacherAssignmentCommand request, CancellationToken cancellationToken)
    {
        var assignment = await _context.TeacherAssignments.FindAsync(new object[] { request.AssignmentId }, cancellationToken);
        if (assignment == null)
        {
            return Result.Failure(Error.NotFound("TeacherAssignment.NotFound", "Teacher assignment not found."));
        }

        assignment.IsActive = false;
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

public record GetTeacherAssignmentsQuery(
    Guid? StaffId = null,
    Guid? SectionId = null,
    Guid? ProgramId = null,
    Guid? AcademicYearId = null) : IRequest<Result<IReadOnlyList<TeacherAssignmentDto>>>;

public class GetTeacherAssignmentsQueryHandler : IRequestHandler<GetTeacherAssignmentsQuery, Result<IReadOnlyList<TeacherAssignmentDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetTeacherAssignmentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<TeacherAssignmentDto>>> Handle(GetTeacherAssignmentsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.TeacherAssignments
            .AsNoTracking()
            .Where(ta => ta.IsActive);

        if (request.StaffId.HasValue)
        {
            query = query.Where(ta => ta.StaffId == request.StaffId.Value);
        }

        if (request.SectionId.HasValue)
        {
            query = query.Where(ta => ta.SectionId == request.SectionId.Value);
        }

        if (request.ProgramId.HasValue)
        {
            query = query.Where(ta => ta.ProgramId == request.ProgramId.Value);
        }

        if (request.AcademicYearId.HasValue)
        {
            query = query.Where(ta => ta.AcademicYearId == request.AcademicYearId.Value);
        }

        var list = await query
            .OrderBy(ta => ta.Program.Name)
            .ThenBy(ta => ta.Subject.Name)
            .Select(ta => new TeacherAssignmentDto(
                ta.Id,
                ta.StaffId,
                ta.Staff.FullName,
                ta.Staff.EmployeeCode,
                ta.SubjectId,
                ta.Subject.Code,
                ta.Subject.Name,
                ta.ProgramId,
                ta.Program.Name,
                ta.SectionId,
                ta.Section != null ? ta.Section.Name : null,
                ta.AcademicYearId,
                ta.AcademicYear.Name,
                ta.AcademicPeriodId,
                ta.AcademicPeriod != null ? ta.AcademicPeriod.Name : null,
                ta.IsPrimaryTeacher,
                ta.AssignedDate,
                ta.IsActive,
                ta.Remarks))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<TeacherAssignmentDto>>(list);
    }
}
