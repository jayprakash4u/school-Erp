using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Academics;
using SchoolERP.Domain.Entities.Academics;

namespace SchoolERP.Application.Academics.Levels;

public record CreateAcademicLevelCommand(
    Guid OrganizationId,
    string Code,
    string Name,
    AcademicLevelCategory Category,
    int SequenceOrder = 1,
    string? Description = null,
    Guid? CampusId = null) : IRequest<Result<AcademicLevelDto>>;

public class CreateAcademicLevelCommandValidator : AbstractValidator<CreateAcademicLevelCommand>
{
    public CreateAcademicLevelCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}

public class CreateAcademicLevelCommandHandler : IRequestHandler<CreateAcademicLevelCommand, Result<AcademicLevelDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateAcademicLevelCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AcademicLevelDto>> Handle(CreateAcademicLevelCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.AcademicLevels
            .AnyAsync(l => l.OrganizationId == request.OrganizationId && l.Code == request.Code.Trim(), cancellationToken);

        if (exists)
        {
            return Result.Failure<AcademicLevelDto>(Error.Conflict("AcademicLevel.DuplicateCode", $"Academic level '{request.Code}' already exists."));
        }

        var level = new AcademicLevel(
            request.OrganizationId,
            request.Code.Trim(),
            request.Name.Trim(),
            request.Category,
            request.SequenceOrder,
            request.CampusId)
        {
            Description = request.Description,
            IsActive = true
        };

        _context.AcademicLevels.Add(level);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new AcademicLevelDto(
            level.Id,
            level.OrganizationId,
            level.CampusId,
            level.Code,
            level.Name,
            level.Category,
            level.SequenceOrder,
            level.Description,
            level.IsActive,
            0);

        return Result.Success(dto);
    }
}

public record GetAcademicLevelsQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<IReadOnlyList<AcademicLevelDto>>>;

public class GetAcademicLevelsQueryHandler : IRequestHandler<GetAcademicLevelsQuery, Result<IReadOnlyList<AcademicLevelDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetAcademicLevelsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<AcademicLevelDto>>> Handle(GetAcademicLevelsQuery request, CancellationToken cancellationToken)
    {
        var levels = await _context.AcademicLevels
            .Include(l => l.Programs)
            .AsNoTracking()
            .Where(l => l.OrganizationId == request.OrganizationId)
            .OrderBy(l => l.SequenceOrder)
            .Select(l => new AcademicLevelDto(
                l.Id,
                l.OrganizationId,
                l.CampusId,
                l.Code,
                l.Name,
                l.Category,
                l.SequenceOrder,
                l.Description,
                l.IsActive,
                l.Programs.Count))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<AcademicLevelDto>>(levels);
    }
}
