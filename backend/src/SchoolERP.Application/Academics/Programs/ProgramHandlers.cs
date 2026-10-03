using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Academics;
using SchoolERP.Domain.Entities.Academics;

namespace SchoolERP.Application.Academics.Programs;

public record CreateProgramCommand(
    Guid OrganizationId,
    Guid AcademicLevelId,
    string Code,
    string Name,
    string? ShortName = null,
    string? Description = null,
    int DurationYears = 1,
    int TotalSemesters = 1,
    int? TotalCreditsRequired = null,
    bool HasStreams = false,
    Guid? CampusId = null) : IRequest<Result<ProgramDto>>;

public class CreateProgramCommandValidator : AbstractValidator<CreateProgramCommand>
{
    public CreateProgramCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.AcademicLevelId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DurationYears).GreaterThan(0);
    }
}

public class CreateProgramCommandHandler : IRequestHandler<CreateProgramCommand, Result<ProgramDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateProgramCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ProgramDto>> Handle(CreateProgramCommand request, CancellationToken cancellationToken)
    {
        var level = await _context.AcademicLevels.FindAsync(new object[] { request.AcademicLevelId }, cancellationToken);
        if (level == null)
        {
            return Result.Failure<ProgramDto>(Error.NotFound("AcademicLevel.NotFound", "Academic level not found."));
        }

        var exists = await _context.Programs
            .AnyAsync(p => p.OrganizationId == request.OrganizationId && p.Code == request.Code.Trim(), cancellationToken);

        if (exists)
        {
            return Result.Failure<ProgramDto>(Error.Conflict("Program.DuplicateCode", $"Program/Grade with code '{request.Code}' already exists."));
        }

        var program = new Domain.Entities.Academics.Program(
            request.OrganizationId,
            request.AcademicLevelId,
            request.Code.Trim(),
            request.Name.Trim(),
            request.DurationYears,
            request.TotalSemesters,
            request.CampusId)
        {
            ShortName = request.ShortName,
            Description = request.Description,
            TotalCreditsRequired = request.TotalCreditsRequired,
            HasStreams = request.HasStreams,
            IsActive = true
        };

        _context.Programs.Add(program);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new ProgramDto(
            program.Id,
            program.OrganizationId,
            program.CampusId,
            program.AcademicLevelId,
            level.Name,
            program.Code,
            program.Name,
            program.ShortName,
            program.DurationYears,
            program.TotalSemesters,
            program.TotalCreditsRequired,
            program.HasStreams,
            program.IsActive,
            0,
            0);

        return Result.Success(dto);
    }
}

public record GetProgramsQuery(Guid OrganizationId, Guid? AcademicLevelId = null, Guid? CampusId = null) : IRequest<Result<IReadOnlyList<ProgramDto>>>;

public class GetProgramsQueryHandler : IRequestHandler<GetProgramsQuery, Result<IReadOnlyList<ProgramDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetProgramsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<ProgramDto>>> Handle(GetProgramsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Programs
            .Include(p => p.AcademicLevel)
            .Include(p => p.Streams)
            .Include(p => p.Sections)
            .AsNoTracking()
            .Where(p => p.OrganizationId == request.OrganizationId);

        if (request.AcademicLevelId.HasValue)
        {
            query = query.Where(p => p.AcademicLevelId == request.AcademicLevelId.Value);
        }

        var programs = await query
            .OrderBy(p => p.AcademicLevel.SequenceOrder)
            .ThenBy(p => p.Name)
            .Select(p => new ProgramDto(
                p.Id,
                p.OrganizationId,
                p.CampusId,
                p.AcademicLevelId,
                p.AcademicLevel.Name,
                p.Code,
                p.Name,
                p.ShortName,
                p.DurationYears,
                p.TotalSemesters,
                p.TotalCreditsRequired,
                p.HasStreams,
                p.IsActive,
                p.Streams.Count,
                p.Sections.Count))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<ProgramDto>>(programs);
    }
}

public record GetProgramByIdQuery(Guid Id) : IRequest<Result<ProgramDetailDto>>;

public class GetProgramByIdQueryHandler : IRequestHandler<GetProgramByIdQuery, Result<ProgramDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProgramByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ProgramDetailDto>> Handle(GetProgramByIdQuery request, CancellationToken cancellationToken)
    {
        var p = await _context.Programs
            .Include(p => p.AcademicLevel)
            .Include(p => p.Streams)
            .Include(p => p.Sections)
                .ThenInclude(s => s.AcademicYear)
            .Include(p => p.SubjectGroups)
                .ThenInclude(sg => sg.GroupItems)
                    .ThenInclude(gi => gi.Subject)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (p == null)
        {
            return Result.Failure<ProgramDetailDto>(Error.NotFound("Program.NotFound", $"Program with ID {request.Id} was not found."));
        }

        var streamDtos = p.Streams.Select(s => new StreamDto(s.Id, s.ProgramId, s.Code, s.Name, s.Description, s.IsActive)).ToList();
        var sectionDtos = p.Sections.Select(s => new SectionDto(
            s.Id,
            s.OrganizationId,
            s.CampusId,
            s.ProgramId,
            p.Name,
            s.StreamId,
            null,
            s.AcademicYearId,
            s.AcademicYear.Name,
            s.BatchId,
            null,
            s.AcademicPeriodId,
            null,
            s.Code,
            s.Name,
            s.RoomNumber,
            s.MaxCapacity,
            s.ClassTeacherId,
            s.IsActive)).ToList();

        var subjectGroupDtos = p.SubjectGroups.Select(sg => new SubjectGroupDto(
            sg.Id,
            sg.ProgramId,
            sg.Name,
            sg.Description,
            sg.MinSelectable,
            sg.MaxSelectable,
            sg.IsElectiveGroup,
            sg.IsActive,
            sg.GroupItems.Select(gi => new SubjectDto(
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
                gi.Subject.IsActive)).ToList())).ToList();

        var detail = new ProgramDetailDto(
            p.Id,
            p.OrganizationId,
            p.CampusId,
            p.AcademicLevelId,
            p.AcademicLevel.Name,
            p.Code,
            p.Name,
            p.ShortName,
            p.Description,
            p.DurationYears,
            p.TotalSemesters,
            p.TotalCreditsRequired,
            p.HasStreams,
            p.IsActive,
            streamDtos,
            sectionDtos,
            subjectGroupDtos);

        return Result.Success(detail);
    }
}
