using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Academics;
using SchoolERP.Domain.Entities.Academics;

namespace SchoolERP.Application.Academics.Subjects;

public record CreateSubjectCommand(
    Guid OrganizationId,
    string Code,
    string Name,
    string? ShortName = null,
    SubjectType Type = SubjectType.Theory,
    decimal Credits = 1.0m,
    int? TotalMarks = 100,
    int? PassingMarks = 40,
    int? WeeklyTheoryHours = null,
    int? WeeklyPracticalHours = null,
    bool IsElective = false,
    string? Description = null,
    Guid? CampusId = null) : IRequest<Result<SubjectDto>>;

public class CreateSubjectCommandValidator : AbstractValidator<CreateSubjectCommand>
{
    public CreateSubjectCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Credits).GreaterThanOrEqualTo(0);
    }
}

public class CreateSubjectCommandHandler : IRequestHandler<CreateSubjectCommand, Result<SubjectDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateSubjectCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SubjectDto>> Handle(CreateSubjectCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.Subjects
            .AnyAsync(s => s.OrganizationId == request.OrganizationId && s.Code == request.Code.Trim(), cancellationToken);

        if (exists)
        {
            return Result.Failure<SubjectDto>(Error.Conflict("Subject.DuplicateCode", $"Subject with code '{request.Code}' already exists."));
        }

        var subject = new Subject(
            request.OrganizationId,
            request.Code.Trim(),
            request.Name.Trim(),
            request.Type,
            request.Credits,
            request.IsElective,
            request.CampusId)
        {
            ShortName = request.ShortName,
            TotalMarks = request.TotalMarks,
            PassingMarks = request.PassingMarks,
            WeeklyTheoryHours = request.WeeklyTheoryHours,
            WeeklyPracticalHours = request.WeeklyPracticalHours,
            Description = request.Description,
            IsActive = true
        };

        _context.Subjects.Add(subject);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new SubjectDto(
            subject.Id,
            subject.OrganizationId,
            subject.CampusId,
            subject.Code,
            subject.Name,
            subject.ShortName,
            subject.Type,
            subject.Credits,
            subject.TotalMarks,
            subject.PassingMarks,
            subject.WeeklyTheoryHours,
            subject.WeeklyPracticalHours,
            subject.IsElective,
            subject.Description,
            subject.IsActive);

        return Result.Success(dto);
    }
}

public record GetSubjectsQuery(
    Guid OrganizationId, 
    SubjectType? Type = null, 
    bool? IsElective = null, 
    Guid? CampusId = null) : IRequest<Result<IReadOnlyList<SubjectDto>>>;

public class GetSubjectsQueryHandler : IRequestHandler<GetSubjectsQuery, Result<IReadOnlyList<SubjectDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetSubjectsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<SubjectDto>>> Handle(GetSubjectsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Subjects
            .AsNoTracking()
            .Where(s => s.OrganizationId == request.OrganizationId);

        if (request.Type.HasValue)
        {
            query = query.Where(s => s.Type == request.Type.Value);
        }

        if (request.IsElective.HasValue)
        {
            query = query.Where(s => s.IsElective == request.IsElective.Value);
        }

        var subjects = await query
            .OrderBy(s => s.Name)
            .Select(s => new SubjectDto(
                s.Id,
                s.OrganizationId,
                s.CampusId,
                s.Code,
                s.Name,
                s.ShortName,
                s.Type,
                s.Credits,
                s.TotalMarks,
                s.PassingMarks,
                s.WeeklyTheoryHours,
                s.WeeklyPracticalHours,
                s.IsElective,
                s.Description,
                s.IsActive))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<SubjectDto>>(subjects);
    }
}

public record CreateSubjectGroupCommand(
    Guid OrganizationId,
    Guid ProgramId,
    string Name,
    bool IsElectiveGroup = false,
    int MinSelectable = 1,
    int MaxSelectable = 1,
    string? Description = null,
    List<Guid>? SubjectIds = null,
    Guid? CampusId = null) : IRequest<Result<SubjectGroupDto>>;

public class CreateSubjectGroupCommandHandler : IRequestHandler<CreateSubjectGroupCommand, Result<SubjectGroupDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateSubjectGroupCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SubjectGroupDto>> Handle(CreateSubjectGroupCommand request, CancellationToken cancellationToken)
    {
        var group = new SubjectGroup(
            request.OrganizationId,
            request.ProgramId,
            request.Name.Trim(),
            request.IsElectiveGroup,
            request.MinSelectable,
            request.MaxSelectable,
            request.CampusId)
        {
            Description = request.Description,
            IsActive = true
        };

        if (request.SubjectIds != null && request.SubjectIds.Any())
        {
            var subjects = await _context.Subjects
                .Where(s => request.SubjectIds.Contains(s.Id))
                .ToListAsync(cancellationToken);

            int order = 1;
            foreach (var s in subjects)
            {
                group.GroupItems.Add(new SubjectGroupItem
                {
                    SubjectGroupId = group.Id,
                    SubjectId = s.Id,
                    SequenceOrder = order++
                });
            }
        }

        _context.SubjectGroups.Add(group);
        await _context.SaveChangesAsync(cancellationToken);

        var groupDto = new SubjectGroupDto(
            group.Id,
            group.ProgramId,
            group.Name,
            group.Description,
            group.MinSelectable,
            group.MaxSelectable,
            group.IsElectiveGroup,
            group.IsActive,
            group.GroupItems.Select(gi => new SubjectDto(
                gi.Subject.Id,
                gi.Subject.OrganizationId,
                gi.Subject.CampusId,
                gi.Subject.Code,
                gi.Subject.Name,
                gi.Subject.ShortName,
                gi.Subject.Type,
                gi.Subject.Credits,
                gi.Subject.TotalMarks,
                gi.Subject.PassingMarks,
                gi.Subject.WeeklyTheoryHours,
                gi.Subject.WeeklyPracticalHours,
                gi.Subject.IsElective,
                gi.Subject.Description,
                gi.Subject.IsActive)).ToList());

        return Result.Success(groupDto);
    }
}
