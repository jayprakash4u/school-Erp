using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Academics;
using SchoolERP.Domain.Entities.Academics;

namespace SchoolERP.Application.Academics.Years;

// --- Commands ---
public record CreateAcademicYearCommand(
    Guid OrganizationId,
    string Code,
    string Name,
    DateOnly StartDate,
    DateOnly EndDate,
    Guid? CampusId = null,
    bool IsCurrent = false) : IRequest<Result<AcademicYearDto>>;

public class CreateAcademicYearCommandValidator : AbstractValidator<CreateAcademicYearCommand>
{
    public CreateAcademicYearCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.EndDate).GreaterThan(x => x.StartDate).WithMessage("End date must be after start date.");
    }
}

public class CreateAcademicYearCommandHandler : IRequestHandler<CreateAcademicYearCommand, Result<AcademicYearDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateAcademicYearCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AcademicYearDto>> Handle(CreateAcademicYearCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.AcademicYears
            .AnyAsync(y => y.OrganizationId == request.OrganizationId && y.Code == request.Code.Trim(), cancellationToken);

        if (exists)
        {
            return Result.Failure<AcademicYearDto>(Error.Conflict("AcademicYear.DuplicateCode", $"Academic year with code '{request.Code}' already exists."));
        }

        if (request.IsCurrent)
        {
            var existingCurrent = await _context.AcademicYears
                .Where(y => y.OrganizationId == request.OrganizationId && y.IsCurrent)
                .ToListAsync(cancellationToken);

            foreach (var y in existingCurrent)
            {
                y.IsCurrent = false;
            }
        }

        var year = new AcademicYear(
            request.OrganizationId,
            request.Code.Trim(),
            request.Name.Trim(),
            request.StartDate,
            request.EndDate,
            request.CampusId,
            request.IsCurrent);

        _context.AcademicYears.Add(year);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new AcademicYearDto(
            year.Id,
            year.OrganizationId,
            year.CampusId,
            year.Code,
            year.Name,
            year.StartDate,
            year.EndDate,
            year.IsCurrent,
            year.IsActive,
            0,
            0);

        return Result.Success(dto);
    }
}

public record SetCurrentAcademicYearCommand(Guid OrganizationId, Guid AcademicYearId) : IRequest<Result>;

public class SetCurrentAcademicYearCommandHandler : IRequestHandler<SetCurrentAcademicYearCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public SetCurrentAcademicYearCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(SetCurrentAcademicYearCommand request, CancellationToken cancellationToken)
    {
        var years = await _context.AcademicYears
            .Where(y => y.OrganizationId == request.OrganizationId)
            .ToListAsync(cancellationToken);

        var targetYear = years.FirstOrDefault(y => y.Id == request.AcademicYearId);
        if (targetYear == null)
        {
            return Result.Failure(Error.NotFound("AcademicYear.NotFound", "Academic year not found."));
        }

        foreach (var y in years)
        {
            y.IsCurrent = y.Id == request.AcademicYearId;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

// --- Queries ---
public record GetAcademicYearsQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<IReadOnlyList<AcademicYearDto>>>;

public class GetAcademicYearsQueryHandler : IRequestHandler<GetAcademicYearsQuery, Result<IReadOnlyList<AcademicYearDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetAcademicYearsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<AcademicYearDto>>> Handle(GetAcademicYearsQuery request, CancellationToken cancellationToken)
    {
        var years = await _context.AcademicYears
            .Include(y => y.Periods)
            .Include(y => y.Sections)
            .AsNoTracking()
            .Where(y => y.OrganizationId == request.OrganizationId)
            .OrderByDescending(y => y.StartDate)
            .Select(y => new AcademicYearDto(
                y.Id,
                y.OrganizationId,
                y.CampusId,
                y.Code,
                y.Name,
                y.StartDate,
                y.EndDate,
                y.IsCurrent,
                y.IsActive,
                y.Periods.Count,
                y.Sections.Count))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<AcademicYearDto>>(years);
    }
}
