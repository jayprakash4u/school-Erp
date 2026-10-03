using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Examinations;
using SchoolERP.Domain.Entities.Examinations;

namespace SchoolERP.Application.Examinations;

public record CreateGradingScaleCommand(
    Guid OrganizationId,
    string Name,
    string? Description,
    bool IsDefault,
    IReadOnlyList<CreateGradeRuleRequest> Rules,
    Guid? CampusId = null) : IRequest<Result<GradingScaleDto>>;

public class CreateGradingScaleCommandValidator : AbstractValidator<CreateGradingScaleCommand>
{
    public CreateGradingScaleCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).MaximumLength(250);
        RuleFor(x => x.Rules).NotEmpty().WithMessage("At least one grade rule must be provided.");
    }
}

public class CreateGradingScaleCommandHandler : IRequestHandler<CreateGradingScaleCommand, Result<GradingScaleDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateGradingScaleCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<GradingScaleDto>> Handle(CreateGradingScaleCommand request, CancellationToken cancellationToken)
    {
        var gradingScale = new GradingScale(
            request.OrganizationId,
            request.Name,
            request.Description,
            request.IsDefault,
            request.CampusId);

        foreach (var r in request.Rules)
        {
            var rule = new GradeRule(
                gradingScale.Id,
                r.GradeLetter,
                r.MinPercentage,
                r.MaxPercentage,
                r.GradePoint,
                r.Description);

            gradingScale.Rules.Add(rule);
        }

        _context.GradingScales.Add(gradingScale);
        await _context.SaveChangesAsync(cancellationToken);

        var ruleDtos = gradingScale.Rules.Select(r => new GradeRuleDto(
            r.Id,
            r.GradeLetter,
            r.MinPercentage,
            r.MaxPercentage,
            r.GradePoint,
            r.Description)).ToList();

        var dto = new GradingScaleDto(
            gradingScale.Id,
            gradingScale.OrganizationId,
            gradingScale.Name,
            gradingScale.Description,
            gradingScale.IsDefault,
            ruleDtos);

        return Result.Success(dto);
    }
}

public record GetGradingScalesQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<IReadOnlyList<GradingScaleDto>>>;

public class GetGradingScalesQueryHandler : IRequestHandler<GetGradingScalesQuery, Result<IReadOnlyList<GradingScaleDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetGradingScalesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<GradingScaleDto>>> Handle(GetGradingScalesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.GradingScales
            .AsNoTracking()
            .Include(g => g.Rules)
            .Where(g => g.OrganizationId == request.OrganizationId);

        if (request.CampusId.HasValue)
        {
            query = query.Where(g => g.CampusId == null || g.CampusId == request.CampusId);
        }

        var scales = await query
            .OrderByDescending(g => g.IsDefault)
            .ThenBy(g => g.Name)
            .ToListAsync(cancellationToken);

        var dtos = scales.Select(g => new GradingScaleDto(
            g.Id,
            g.OrganizationId,
            g.Name,
            g.Description,
            g.IsDefault,
            g.Rules.OrderByDescending(r => r.MinPercentage)
                .Select(r => new GradeRuleDto(
                    r.Id,
                    r.GradeLetter,
                    r.MinPercentage,
                    r.MaxPercentage,
                    r.GradePoint,
                    r.Description)).ToList()
        )).ToList();

        return Result.Success<IReadOnlyList<GradingScaleDto>>(dtos);
    }
}
