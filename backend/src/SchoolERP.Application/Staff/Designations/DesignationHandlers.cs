using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Staff;
using SchoolERP.Domain.Entities.Staff;

namespace SchoolERP.Application.Staff.Designations;

public record CreateDesignationCommand(
    Guid OrganizationId,
    string Code,
    string Title,
    bool IsTeachingRole = false,
    string? Description = null,
    Guid? CampusId = null) : IRequest<Result<DesignationDto>>;

public class CreateDesignationCommandValidator : AbstractValidator<CreateDesignationCommand>
{
    public CreateDesignationCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Title).NotEmpty().MaximumLength(150);
    }
}

public class CreateDesignationCommandHandler : IRequestHandler<CreateDesignationCommand, Result<DesignationDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateDesignationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DesignationDto>> Handle(CreateDesignationCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.Designations
            .AnyAsync(d => d.OrganizationId == request.OrganizationId && d.Code == request.Code.Trim(), cancellationToken);

        if (exists)
        {
            return Result.Failure<DesignationDto>(Error.Conflict("Designation.DuplicateCode", $"Designation with code '{request.Code}' already exists."));
        }

        var designation = new Designation(
            request.OrganizationId,
            request.Code.Trim(),
            request.Title.Trim(),
            request.IsTeachingRole,
            request.Description?.Trim(),
            request.CampusId);

        _context.Designations.Add(designation);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new DesignationDto(
            designation.Id,
            designation.OrganizationId,
            designation.CampusId,
            designation.Code,
            designation.Title,
            designation.Description,
            designation.IsTeachingRole,
            designation.IsActive,
            0);

        return Result.Success(dto);
    }
}

public record GetDesignationsQuery(
    Guid OrganizationId,
    Guid? CampusId = null,
    bool? IsTeachingRole = null) : IRequest<Result<IReadOnlyList<DesignationDto>>>;

public class GetDesignationsQueryHandler : IRequestHandler<GetDesignationsQuery, Result<IReadOnlyList<DesignationDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetDesignationsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<DesignationDto>>> Handle(GetDesignationsQuery request, CancellationToken cancellationToken)
    {
        var designations = await _context.Designations
            .AsNoTracking()
            .Where(d => d.OrganizationId == request.OrganizationId &&
                        (!request.CampusId.HasValue || d.CampusId == request.CampusId.Value) &&
                        (!request.IsTeachingRole.HasValue || d.IsTeachingRole == request.IsTeachingRole.Value))
            .OrderBy(d => d.Title)
            .Select(d => new DesignationDto(
                d.Id,
                d.OrganizationId,
                d.CampusId,
                d.Code,
                d.Title,
                d.Description,
                d.IsTeachingRole,
                d.IsActive,
                d.StaffMembers.Count(s => s.Status == StaffStatus.Active)))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<DesignationDto>>(designations);
    }
}
