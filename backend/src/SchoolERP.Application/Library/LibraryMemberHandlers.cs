using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Library;
using SchoolERP.Domain.Entities.Library;

namespace SchoolERP.Application.Library;

public record RegisterLibraryMemberCommand(
    Guid OrganizationId,
    MemberType MemberType,
    Guid? StudentId = null,
    Guid? StaffId = null,
    int IssueLimit = 3,
    int MaxIssueDays = 14,
    decimal FinePerDay = 1.0m,
    Guid? CampusId = null) : IRequest<Result<LibraryMemberDto>>;

public class RegisterLibraryMemberCommandValidator : AbstractValidator<RegisterLibraryMemberCommand>
{
    public RegisterLibraryMemberCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.IssueLimit).GreaterThan(0);
        RuleFor(x => x.MaxIssueDays).GreaterThan(0);
        RuleFor(x => x.FinePerDay).GreaterThanOrEqualTo(0);
    }
}

public class RegisterLibraryMemberCommandHandler : IRequestHandler<RegisterLibraryMemberCommand, Result<LibraryMemberDto>>
{
    private readonly IApplicationDbContext _context;

    public RegisterLibraryMemberCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LibraryMemberDto>> Handle(RegisterLibraryMemberCommand request, CancellationToken cancellationToken)
    {
        string? studentName = null;
        string? admissionNumber = null;
        string? staffName = null;
        string? employeeCode = null;

        if (request.MemberType == MemberType.Student)
        {
            if (!request.StudentId.HasValue)
            {
                return Result.Failure<LibraryMemberDto>(Error.Validation("LibraryMember.StudentRequired", "StudentId must be provided for student library membership."));
            }

            var student = await _context.Students.FindAsync(new object[] { request.StudentId.Value }, cancellationToken);
            if (student == null)
            {
                return Result.Failure<LibraryMemberDto>(Error.NotFound("Student.NotFound", "Student not found."));
            }

            var alreadyRegistered = await _context.LibraryMembers
                .AnyAsync(m => m.StudentId == request.StudentId.Value && m.OrganizationId == request.OrganizationId, cancellationToken);

            if (alreadyRegistered)
            {
                return Result.Failure<LibraryMemberDto>(Error.Conflict("LibraryMember.AlreadyRegistered", "Student is already registered as a library member."));
            }

            studentName = $"{student.FirstName} {student.LastName}";
            admissionNumber = student.AdmissionNumber;
        }
        else
        {
            if (!request.StaffId.HasValue)
            {
                return Result.Failure<LibraryMemberDto>(Error.Validation("LibraryMember.StaffRequired", "StaffId must be provided for staff library membership."));
            }

            var staff = await _context.Staff.FindAsync(new object[] { request.StaffId.Value }, cancellationToken);
            if (staff == null)
            {
                return Result.Failure<LibraryMemberDto>(Error.NotFound("Staff.NotFound", "Staff member not found."));
            }

            var alreadyRegistered = await _context.LibraryMembers
                .AnyAsync(m => m.StaffId == request.StaffId.Value && m.OrganizationId == request.OrganizationId, cancellationToken);

            if (alreadyRegistered)
            {
                return Result.Failure<LibraryMemberDto>(Error.Conflict("LibraryMember.AlreadyRegistered", "Staff member is already registered as a library member."));
            }

            staffName = $"{staff.FirstName} {staff.LastName}";
            employeeCode = staff.EmployeeCode;
        }

        var count = await _context.LibraryMembers.CountAsync(m => m.OrganizationId == request.OrganizationId, cancellationToken);
        var membershipNumber = $"LIB-M-{(count + 1):D5}";

        var member = new LibraryMember(
            request.OrganizationId,
            membershipNumber,
            request.MemberType,
            request.StudentId,
            request.StaffId,
            request.IssueLimit,
            request.MaxIssueDays,
            request.FinePerDay,
            request.CampusId);

        _context.LibraryMembers.Add(member);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new LibraryMemberDto(
            member.Id,
            member.OrganizationId,
            member.CampusId,
            member.MembershipNumber,
            member.MemberType,
            member.StudentId,
            studentName,
            admissionNumber,
            member.StaffId,
            staffName,
            employeeCode,
            member.IssueLimit,
            member.MaxIssueDays,
            member.FinePerDay,
            member.Status,
            0,
            0,
            member.CreatedAtUtc);

        return Result.Success(dto);
    }
}

public record GetLibraryMembersQuery(
    Guid OrganizationId,
    MemberType? MemberType = null,
    MembershipStatus? Status = null,
    Guid? CampusId = null) : IRequest<Result<IReadOnlyList<LibraryMemberDto>>>;

public class GetLibraryMembersQueryHandler : IRequestHandler<GetLibraryMembersQuery, Result<IReadOnlyList<LibraryMemberDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetLibraryMembersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<LibraryMemberDto>>> Handle(GetLibraryMembersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.LibraryMembers
            .AsNoTracking()
            .Include(m => m.Student)
            .Include(m => m.Staff)
            .Include(m => m.Issues)
            .Include(m => m.Fines)
            .Where(m => m.OrganizationId == request.OrganizationId);

        if (request.CampusId.HasValue)
        {
            query = query.Where(m => m.CampusId == null || m.CampusId == request.CampusId.Value);
        }

        if (request.MemberType.HasValue)
        {
            query = query.Where(m => m.MemberType == request.MemberType.Value);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(m => m.Status == request.Status.Value);
        }

        var members = await query
            .OrderBy(m => m.MembershipNumber)
            .ToListAsync(cancellationToken);

        var dtos = members.Select(m => new LibraryMemberDto(
            m.Id,
            m.OrganizationId,
            m.CampusId,
            m.MembershipNumber,
            m.MemberType,
            m.StudentId,
            m.Student != null ? $"{m.Student.FirstName} {m.Student.LastName}" : null,
            m.Student?.AdmissionNumber,
            m.StaffId,
            m.Staff != null ? $"{m.Staff.FirstName} {m.Staff.LastName}" : null,
            m.Staff?.EmployeeCode,
            m.IssueLimit,
            m.MaxIssueDays,
            m.FinePerDay,
            m.Status,
            m.Issues.Count(i => i.Status == IssueStatus.Issued || i.Status == IssueStatus.Overdue),
            m.Fines.Where(f => f.Status == FineStatus.Pending).Sum(f => f.Amount - f.PaidAmount),
            m.CreatedAtUtc
        )).ToList();

        return Result.Success<IReadOnlyList<LibraryMemberDto>>(dtos);
    }
}

public record GetLibraryMemberByIdQuery(Guid MemberId) : IRequest<Result<LibraryMemberDto>>;

public class GetLibraryMemberByIdQueryHandler : IRequestHandler<GetLibraryMemberByIdQuery, Result<LibraryMemberDto>>
{
    private readonly IApplicationDbContext _context;

    public GetLibraryMemberByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LibraryMemberDto>> Handle(GetLibraryMemberByIdQuery request, CancellationToken cancellationToken)
    {
        var member = await _context.LibraryMembers
            .AsNoTracking()
            .Include(m => m.Student)
            .Include(m => m.Staff)
            .Include(m => m.Issues)
            .Include(m => m.Fines)
            .FirstOrDefaultAsync(m => m.Id == request.MemberId, cancellationToken);

        if (member == null)
        {
            return Result.Failure<LibraryMemberDto>(Error.NotFound("LibraryMember.NotFound", "Library member not found."));
        }

        var dto = new LibraryMemberDto(
            member.Id,
            member.OrganizationId,
            member.CampusId,
            member.MembershipNumber,
            member.MemberType,
            member.StudentId,
            member.Student != null ? $"{member.Student.FirstName} {member.Student.LastName}" : null,
            member.Student?.AdmissionNumber,
            member.StaffId,
            member.Staff != null ? $"{member.Staff.FirstName} {member.Staff.LastName}" : null,
            member.Staff?.EmployeeCode,
            member.IssueLimit,
            member.MaxIssueDays,
            member.FinePerDay,
            member.Status,
            member.Issues.Count(i => i.Status == IssueStatus.Issued || i.Status == IssueStatus.Overdue),
            member.Fines.Where(f => f.Status == FineStatus.Pending).Sum(f => f.Amount - f.PaidAmount),
            member.CreatedAtUtc);

        return Result.Success(dto);
    }
}
