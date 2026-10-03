using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Staff;
using SchoolERP.Domain.Entities.Staff;

namespace SchoolERP.Application.Staff.Departments;

public record CreateDepartmentCommand(
    Guid OrganizationId,
    string Code,
    string Name,
    string? Description = null,
    Guid? HeadOfDepartmentStaffId = null,
    Guid? CampusId = null) : IRequest<Result<DepartmentDto>>;

public class CreateDepartmentCommandValidator : AbstractValidator<CreateDepartmentCommand>
{
    public CreateDepartmentCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
    }
}

public class CreateDepartmentCommandHandler : IRequestHandler<CreateDepartmentCommand, Result<DepartmentDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateDepartmentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DepartmentDto>> Handle(CreateDepartmentCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.Departments
            .AnyAsync(d => d.OrganizationId == request.OrganizationId && d.Code == request.Code.Trim(), cancellationToken);

        if (exists)
        {
            return Result.Failure<DepartmentDto>(Error.Conflict("Department.DuplicateCode", $"Department with code '{request.Code}' already exists."));
        }

        var department = new Department(
            request.OrganizationId,
            request.Code.Trim(),
            request.Name.Trim(),
            request.Description?.Trim(),
            request.CampusId,
            request.HeadOfDepartmentStaffId);

        _context.Departments.Add(department);
        await _context.SaveChangesAsync(cancellationToken);

        string? hodName = null;
        if (request.HeadOfDepartmentStaffId.HasValue)
        {
            var hod = await _context.Staff.FindAsync(new object[] { request.HeadOfDepartmentStaffId.Value }, cancellationToken);
            hodName = hod?.FullName;
        }

        var dto = new DepartmentDto(
            department.Id,
            department.OrganizationId,
            department.CampusId,
            department.Code,
            department.Name,
            department.Description,
            department.HeadOfDepartmentStaffId,
            hodName,
            department.IsActive,
            0);

        return Result.Success(dto);
    }
}

public record GetDepartmentsQuery(
    Guid OrganizationId,
    Guid? CampusId = null) : IRequest<Result<IReadOnlyList<DepartmentDto>>>;

public class GetDepartmentsQueryHandler : IRequestHandler<GetDepartmentsQuery, Result<IReadOnlyList<DepartmentDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetDepartmentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<DepartmentDto>>> Handle(GetDepartmentsQuery request, CancellationToken cancellationToken)
    {
        var departments = await _context.Departments
            .AsNoTracking()
            .Where(d => d.OrganizationId == request.OrganizationId &&
                        (!request.CampusId.HasValue || d.CampusId == request.CampusId.Value))
            .OrderBy(d => d.Name)
            .Select(d => new DepartmentDto(
                d.Id,
                d.OrganizationId,
                d.CampusId,
                d.Code,
                d.Name,
                d.Description,
                d.HeadOfDepartmentStaffId,
                d.HeadOfDepartment != null ? d.HeadOfDepartment.FullName : null,
                d.IsActive,
                d.StaffMembers.Count(s => s.Status == StaffStatus.Active)))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<DepartmentDto>>(departments);
    }
}
