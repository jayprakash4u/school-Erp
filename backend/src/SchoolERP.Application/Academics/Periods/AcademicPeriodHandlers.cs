using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Academics;
using SchoolERP.Domain.Entities.Academics;

namespace SchoolERP.Application.Academics.Periods;

public record CreateAcademicPeriodCommand(
    Guid AcademicYearId,
    string Code,
    string Name,
    AcademicPeriodType Type,
    DateOnly StartDate,
    DateOnly EndDate,
    int SequenceOrder = 1) : IRequest<Result<AcademicPeriodDto>>;

public class CreateAcademicPeriodCommandValidator : AbstractValidator<CreateAcademicPeriodCommand>
{
    public CreateAcademicPeriodCommandValidator()
    {
        RuleFor(x => x.AcademicYearId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.EndDate).GreaterThan(x => x.StartDate).WithMessage("Period end date must be after start date.");
    }
}

public class CreateAcademicPeriodCommandHandler : IRequestHandler<CreateAcademicPeriodCommand, Result<AcademicPeriodDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateAcademicPeriodCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AcademicPeriodDto>> Handle(CreateAcademicPeriodCommand request, CancellationToken cancellationToken)
    {
        var year = await _context.AcademicYears.FindAsync(new object[] { request.AcademicYearId }, cancellationToken);
        if (year == null)
        {
            return Result.Failure<AcademicPeriodDto>(Error.NotFound("AcademicYear.NotFound", "Academic year not found."));
        }

        var period = new AcademicPeriod(
            request.AcademicYearId,
            request.Code.Trim(),
            request.Name.Trim(),
            request.Type,
            request.StartDate,
            request.EndDate,
            request.SequenceOrder);

        _context.AcademicPeriods.Add(period);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new AcademicPeriodDto(
            period.Id,
            period.AcademicYearId,
            period.Code,
            period.Name,
            period.Type,
            period.StartDate,
            period.EndDate,
            period.SequenceOrder,
            period.IsCurrent,
            period.IsActive);

        return Result.Success(dto);
    }
}

public record GetAcademicPeriodsQuery(Guid AcademicYearId) : IRequest<Result<IReadOnlyList<AcademicPeriodDto>>>;

public class GetAcademicPeriodsQueryHandler : IRequestHandler<GetAcademicPeriodsQuery, Result<IReadOnlyList<AcademicPeriodDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetAcademicPeriodsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<AcademicPeriodDto>>> Handle(GetAcademicPeriodsQuery request, CancellationToken cancellationToken)
    {
        var periods = await _context.AcademicPeriods
            .AsNoTracking()
            .Where(p => p.AcademicYearId == request.AcademicYearId)
            .OrderBy(p => p.SequenceOrder)
            .Select(p => new AcademicPeriodDto(
                p.Id,
                p.AcademicYearId,
                p.Code,
                p.Name,
                p.Type,
                p.StartDate,
                p.EndDate,
                p.SequenceOrder,
                p.IsCurrent,
                p.IsActive))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<AcademicPeriodDto>>(periods);
    }
}
