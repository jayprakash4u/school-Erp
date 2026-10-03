using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Examinations;
using SchoolERP.Domain.Entities.Examinations;

namespace SchoolERP.Application.Examinations;

// --- Commands & Queries ---
public record CreateExamTypeCommand(
    Guid OrganizationId,
    string Code,
    string Name,
    string? Description = null,
    Guid? CampusId = null) : IRequest<Result<ExamTypeDto>>;

public class CreateExamTypeCommandValidator : AbstractValidator<CreateExamTypeCommand>
{
    public CreateExamTypeCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).MaximumLength(250);
    }
}

public class CreateExamTypeCommandHandler : IRequestHandler<CreateExamTypeCommand, Result<ExamTypeDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateExamTypeCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ExamTypeDto>> Handle(CreateExamTypeCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.ExamTypes
            .AnyAsync(e => e.OrganizationId == request.OrganizationId && e.Code.ToLower() == request.Code.ToLower(), cancellationToken);

        if (exists)
        {
            return Result.Failure<ExamTypeDto>(Error.Conflict("ExamType.DuplicateCode", $"Exam type with code '{request.Code}' already exists."));
        }

        var examType = new ExamType(
            request.OrganizationId,
            request.Code,
            request.Name,
            request.Description,
            request.CampusId);

        _context.ExamTypes.Add(examType);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new ExamTypeDto(
            examType.Id,
            examType.OrganizationId,
            examType.CampusId,
            examType.Code,
            examType.Name,
            examType.Description,
            examType.IsActive);

        return Result.Success(dto);
    }
}

public record GetExamTypesQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<IReadOnlyList<ExamTypeDto>>>;

public class GetExamTypesQueryHandler : IRequestHandler<GetExamTypesQuery, Result<IReadOnlyList<ExamTypeDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetExamTypesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<ExamTypeDto>>> Handle(GetExamTypesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.ExamTypes
            .AsNoTracking()
            .Where(e => e.OrganizationId == request.OrganizationId);

        if (request.CampusId.HasValue)
        {
            query = query.Where(e => e.CampusId == null || e.CampusId == request.CampusId);
        }

        var list = await query
            .OrderBy(e => e.Name)
            .Select(e => new ExamTypeDto(
                e.Id,
                e.OrganizationId,
                e.CampusId,
                e.Code,
                e.Name,
                e.Description,
                e.IsActive))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<ExamTypeDto>>(list);
    }
}
