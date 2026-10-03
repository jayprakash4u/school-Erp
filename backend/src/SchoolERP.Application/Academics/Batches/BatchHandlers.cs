using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Academics;
using SchoolERP.Domain.Entities.Academics;

namespace SchoolERP.Application.Academics.Batches;

public record CreateBatchCommand(
    Guid OrganizationId,
    Guid ProgramId,
    Guid AcademicYearId,
    string Code,
    string Name,
    int StartYear,
    int EndYear,
    Guid? StreamId = null,
    int? Capacity = null,
    Guid? CampusId = null) : IRequest<Result<BatchDto>>;

public class CreateBatchCommandValidator : AbstractValidator<CreateBatchCommand>
{
    public CreateBatchCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.ProgramId).NotEmpty();
        RuleFor(x => x.AcademicYearId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.EndYear).GreaterThanOrEqualTo(x => x.StartYear);
    }
}

public class CreateBatchCommandHandler : IRequestHandler<CreateBatchCommand, Result<BatchDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateBatchCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<BatchDto>> Handle(CreateBatchCommand request, CancellationToken cancellationToken)
    {
        var program = await _context.Programs.FindAsync(new object[] { request.ProgramId }, cancellationToken);
        if (program == null)
        {
            return Result.Failure<BatchDto>(Error.NotFound("Program.NotFound", "Program not found."));
        }

        var year = await _context.AcademicYears.FindAsync(new object[] { request.AcademicYearId }, cancellationToken);
        if (year == null)
        {
            return Result.Failure<BatchDto>(Error.NotFound("AcademicYear.NotFound", "Academic year not found."));
        }

        var batch = new Batch(
            request.OrganizationId,
            request.ProgramId,
            request.AcademicYearId,
            request.Code.Trim(),
            request.Name.Trim(),
            request.StartYear,
            request.EndYear,
            request.StreamId,
            request.CampusId)
        {
            Capacity = request.Capacity,
            IsActive = true
        };

        _context.Batches.Add(batch);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new BatchDto(
            batch.Id,
            batch.OrganizationId,
            batch.CampusId,
            batch.ProgramId,
            program.Name,
            batch.StreamId,
            null,
            batch.AcademicYearId,
            year.Name,
            batch.Code,
            batch.Name,
            batch.StartYear,
            batch.EndYear,
            batch.Capacity,
            batch.IsActive);

        return Result.Success(dto);
    }
}

public record GetBatchesQuery(Guid OrganizationId, Guid? ProgramId = null, Guid? AcademicYearId = null, Guid? CampusId = null) : IRequest<Result<IReadOnlyList<BatchDto>>>;

public class GetBatchesQueryHandler : IRequestHandler<GetBatchesQuery, Result<IReadOnlyList<BatchDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetBatchesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<BatchDto>>> Handle(GetBatchesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Batches
            .Include(b => b.Program)
            .Include(b => b.Stream)
            .Include(b => b.AcademicYear)
            .AsNoTracking()
            .Where(b => b.OrganizationId == request.OrganizationId);

        if (request.ProgramId.HasValue)
        {
            query = query.Where(b => b.ProgramId == request.ProgramId.Value);
        }

        if (request.AcademicYearId.HasValue)
        {
            query = query.Where(b => b.AcademicYearId == request.AcademicYearId.Value);
        }

        var batches = await query
            .OrderByDescending(b => b.StartYear)
            .Select(b => new BatchDto(
                b.Id,
                b.OrganizationId,
                b.CampusId,
                b.ProgramId,
                b.Program.Name,
                b.StreamId,
                b.Stream != null ? b.Stream.Name : null,
                b.AcademicYearId,
                b.AcademicYear.Name,
                b.Code,
                b.Name,
                b.StartYear,
                b.EndYear,
                b.Capacity,
                b.IsActive))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<BatchDto>>(batches);
    }
}
