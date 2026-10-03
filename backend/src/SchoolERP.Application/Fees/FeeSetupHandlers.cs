using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Fees;
using SchoolERP.Domain.Entities.Fees;

namespace SchoolERP.Application.Fees;

// --- Fee Head Commands & Queries ---
public record CreateFeeHeadCommand(
    Guid OrganizationId,
    string Code,
    string Name,
    FeeCategory Category,
    FeeFrequency Frequency,
    bool IsRefundable = false,
    bool IsOptional = false,
    Guid? CampusId = null) : IRequest<Result<FeeHeadDto>>;

public class CreateFeeHeadCommandValidator : AbstractValidator<CreateFeeHeadCommand>
{
    public CreateFeeHeadCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}

public class CreateFeeHeadCommandHandler : IRequestHandler<CreateFeeHeadCommand, Result<FeeHeadDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateFeeHeadCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<FeeHeadDto>> Handle(CreateFeeHeadCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.FeeHeads
            .AnyAsync(f => f.OrganizationId == request.OrganizationId && f.Code.ToLower() == request.Code.ToLower(), cancellationToken);

        if (exists)
        {
            return Result.Failure<FeeHeadDto>(Error.Conflict("FeeHead.DuplicateCode", $"Fee head with code '{request.Code}' already exists."));
        }

        var feeHead = new FeeHead(
            request.OrganizationId,
            request.Code,
            request.Name,
            request.Category,
            request.Frequency,
            request.IsRefundable,
            request.IsOptional,
            request.CampusId);

        _context.FeeHeads.Add(feeHead);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new FeeHeadDto(
            feeHead.Id,
            feeHead.OrganizationId,
            feeHead.CampusId,
            feeHead.Code,
            feeHead.Name,
            feeHead.Category,
            feeHead.Frequency,
            feeHead.IsRefundable,
            feeHead.IsOptional,
            feeHead.IsActive);

        return Result.Success(dto);
    }
}

public record GetFeeHeadsQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<IReadOnlyList<FeeHeadDto>>>;

public class GetFeeHeadsQueryHandler : IRequestHandler<GetFeeHeadsQuery, Result<IReadOnlyList<FeeHeadDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetFeeHeadsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<FeeHeadDto>>> Handle(GetFeeHeadsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.FeeHeads
            .AsNoTracking()
            .Where(f => f.OrganizationId == request.OrganizationId);

        if (request.CampusId.HasValue)
        {
            query = query.Where(f => f.CampusId == null || f.CampusId == request.CampusId);
        }

        var list = await query
            .OrderBy(f => f.Name)
            .Select(f => new FeeHeadDto(
                f.Id,
                f.OrganizationId,
                f.CampusId,
                f.Code,
                f.Name,
                f.Category,
                f.Frequency,
                f.IsRefundable,
                f.IsOptional,
                f.IsActive))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<FeeHeadDto>>(list);
    }
}

// --- Fee Structure Commands & Queries ---
public record CreateFeeStructureCommand(
    Guid OrganizationId,
    Guid AcademicYearId,
    Guid ProgramId,
    string Name,
    IReadOnlyList<CreateFeeStructureItemRequest> Items,
    Guid? StreamId = null,
    Guid? AcademicPeriodId = null,
    string? Description = null,
    Guid? CampusId = null) : IRequest<Result<FeeStructureDto>>;

public class CreateFeeStructureCommandValidator : AbstractValidator<CreateFeeStructureCommand>
{
    public CreateFeeStructureCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.AcademicYearId).NotEmpty();
        RuleFor(x => x.ProgramId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Items).NotEmpty().WithMessage("Fee structure must contain at least one fee item.");
    }
}

public class CreateFeeStructureCommandHandler : IRequestHandler<CreateFeeStructureCommand, Result<FeeStructureDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateFeeStructureCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<FeeStructureDto>> Handle(CreateFeeStructureCommand request, CancellationToken cancellationToken)
    {
        var year = await _context.AcademicYears.FindAsync(new object[] { request.AcademicYearId }, cancellationToken);
        if (year == null)
        {
            return Result.Failure<FeeStructureDto>(Error.NotFound("AcademicYear.NotFound", "Academic year not found."));
        }

        var program = await _context.Programs.FindAsync(new object[] { request.ProgramId }, cancellationToken);
        if (program == null)
        {
            return Result.Failure<FeeStructureDto>(Error.NotFound("Program.NotFound", "Program/Grade not found."));
        }

        var feeStructure = new FeeStructure(
            request.OrganizationId,
            request.AcademicYearId,
            request.ProgramId,
            request.Name,
            request.Description,
            request.StreamId,
            request.AcademicPeriodId,
            request.CampusId);

        var feeHeadIds = request.Items.Select(i => i.FeeHeadId).Distinct().ToList();
        var feeHeads = await _context.FeeHeads
            .Where(f => feeHeadIds.Contains(f.Id))
            .ToDictionaryAsync(f => f.Id, cancellationToken);

        foreach (var itemReq in request.Items)
        {
            if (!feeHeads.TryGetValue(itemReq.FeeHeadId, out var feeHead))
            {
                return Result.Failure<FeeStructureDto>(Error.NotFound("FeeHead.NotFound", $"Fee head '{itemReq.FeeHeadId}' not found."));
            }

            var item = new FeeStructureItem(
                feeStructure.Id,
                itemReq.FeeHeadId,
                itemReq.Amount,
                itemReq.DueDate,
                itemReq.IsMandatory);

            feeStructure.Items.Add(item);
        }

        _context.FeeStructures.Add(feeStructure);
        await _context.SaveChangesAsync(cancellationToken);

        var itemDtos = feeStructure.Items.Select(i =>
        {
            var fh = feeHeads[i.FeeHeadId];
            return new FeeStructureItemDto(
                i.Id,
                i.FeeHeadId,
                fh.Code,
                fh.Name,
                fh.Category,
                i.Amount,
                i.DueDate,
                i.IsMandatory);
        }).ToList();

        var dto = new FeeStructureDto(
            feeStructure.Id,
            feeStructure.OrganizationId,
            feeStructure.CampusId,
            feeStructure.AcademicYearId,
            year.Name,
            feeStructure.ProgramId,
            program.Name,
            feeStructure.StreamId,
            null,
            feeStructure.AcademicPeriodId,
            null,
            feeStructure.Name,
            feeStructure.Description,
            feeStructure.TotalAmount,
            feeStructure.IsActive,
            itemDtos);

        return Result.Success(dto);
    }
}

public record GetFeeStructuresQuery(
    Guid OrganizationId,
    Guid? AcademicYearId = null,
    Guid? ProgramId = null,
    Guid? CampusId = null) : IRequest<Result<IReadOnlyList<FeeStructureDto>>>;

public class GetFeeStructuresQueryHandler : IRequestHandler<GetFeeStructuresQuery, Result<IReadOnlyList<FeeStructureDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetFeeStructuresQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<FeeStructureDto>>> Handle(GetFeeStructuresQuery request, CancellationToken cancellationToken)
    {
        var query = _context.FeeStructures
            .AsNoTracking()
            .Include(f => f.AcademicYear)
            .Include(f => f.Program)
            .Include(f => f.Stream)
            .Include(f => f.AcademicPeriod)
            .Include(f => f.Items)
                .ThenInclude(i => i.FeeHead)
            .Where(f => f.OrganizationId == request.OrganizationId);

        if (request.AcademicYearId.HasValue)
        {
            query = query.Where(f => f.AcademicYearId == request.AcademicYearId.Value);
        }

        if (request.ProgramId.HasValue)
        {
            query = query.Where(f => f.ProgramId == request.ProgramId.Value);
        }

        if (request.CampusId.HasValue)
        {
            query = query.Where(f => f.CampusId == null || f.CampusId == request.CampusId.Value);
        }

        var list = await query
            .OrderBy(f => f.Program.Name)
            .ThenBy(f => f.Name)
            .ToListAsync(cancellationToken);

        var dtos = list.Select(f => new FeeStructureDto(
            f.Id,
            f.OrganizationId,
            f.CampusId,
            f.AcademicYearId,
            f.AcademicYear.Name,
            f.ProgramId,
            f.Program.Name,
            f.StreamId,
            f.Stream?.Name,
            f.AcademicPeriodId,
            f.AcademicPeriod?.Name,
            f.Name,
            f.Description,
            f.Items.Sum(i => i.Amount),
            f.IsActive,
            f.Items.Select(i => new FeeStructureItemDto(
                i.Id,
                i.FeeHeadId,
                i.FeeHead.Code,
                i.FeeHead.Name,
                i.FeeHead.Category,
                i.Amount,
                i.DueDate,
                i.IsMandatory)).ToList()
        )).ToList();

        return Result.Success<IReadOnlyList<FeeStructureDto>>(dtos);
    }
}

// --- Discount Policies Commands & Queries ---
public record CreateDiscountPolicyCommand(
    Guid OrganizationId,
    string Code,
    string Name,
    DiscountType Type,
    decimal Value,
    string? Description = null,
    Guid? CampusId = null) : IRequest<Result<DiscountPolicyDto>>;

public class CreateDiscountPolicyCommandValidator : AbstractValidator<CreateDiscountPolicyCommand>
{
    public CreateDiscountPolicyCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Value).GreaterThan(0);
    }
}

public class CreateDiscountPolicyCommandHandler : IRequestHandler<CreateDiscountPolicyCommand, Result<DiscountPolicyDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateDiscountPolicyCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DiscountPolicyDto>> Handle(CreateDiscountPolicyCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.DiscountPolicies
            .AnyAsync(d => d.OrganizationId == request.OrganizationId && d.Code.ToLower() == request.Code.ToLower(), cancellationToken);

        if (exists)
        {
            return Result.Failure<DiscountPolicyDto>(Error.Conflict("DiscountPolicy.DuplicateCode", $"Discount policy with code '{request.Code}' already exists."));
        }

        var policy = new DiscountPolicy(
            request.OrganizationId,
            request.Code,
            request.Name,
            request.Type,
            request.Value,
            request.Description,
            request.CampusId);

        _context.DiscountPolicies.Add(policy);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new DiscountPolicyDto(
            policy.Id,
            policy.OrganizationId,
            policy.CampusId,
            policy.Code,
            policy.Name,
            policy.Type,
            policy.Value,
            policy.Description,
            policy.IsActive);

        return Result.Success(dto);
    }
}

public record GetDiscountPoliciesQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<IReadOnlyList<DiscountPolicyDto>>>;

public class GetDiscountPoliciesQueryHandler : IRequestHandler<GetDiscountPoliciesQuery, Result<IReadOnlyList<DiscountPolicyDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetDiscountPoliciesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<DiscountPolicyDto>>> Handle(GetDiscountPoliciesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.DiscountPolicies
            .AsNoTracking()
            .Where(d => d.OrganizationId == request.OrganizationId);

        if (request.CampusId.HasValue)
        {
            query = query.Where(d => d.CampusId == null || d.CampusId == request.CampusId);
        }

        var list = await query
            .OrderBy(d => d.Name)
            .Select(d => new DiscountPolicyDto(
                d.Id,
                d.OrganizationId,
                d.CampusId,
                d.Code,
                d.Name,
                d.Type,
                d.Value,
                d.Description,
                d.IsActive))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<DiscountPolicyDto>>(list);
    }
}
