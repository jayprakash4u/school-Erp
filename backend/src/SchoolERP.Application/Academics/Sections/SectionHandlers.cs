using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Academics;
using SchoolERP.Domain.Entities.Academics;

namespace SchoolERP.Application.Academics.Sections;

public record CreateSectionCommand(
    Guid OrganizationId,
    Guid ProgramId,
    Guid AcademicYearId,
    string Code,
    string Name,
    int MaxCapacity = 40,
    Guid? StreamId = null,
    Guid? BatchId = null,
    Guid? AcademicPeriodId = null,
    string? RoomNumber = null,
    Guid? ClassTeacherId = null,
    Guid? CampusId = null) : IRequest<Result<SectionDto>>;

public class CreateSectionCommandValidator : AbstractValidator<CreateSectionCommand>
{
    public CreateSectionCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.ProgramId).NotEmpty();
        RuleFor(x => x.AcademicYearId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.MaxCapacity).GreaterThan(0);
    }
}

public class CreateSectionCommandHandler : IRequestHandler<CreateSectionCommand, Result<SectionDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateSectionCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SectionDto>> Handle(CreateSectionCommand request, CancellationToken cancellationToken)
    {
        var program = await _context.Programs.FindAsync(new object[] { request.ProgramId }, cancellationToken);
        if (program == null)
        {
            return Result.Failure<SectionDto>(Error.NotFound("Program.NotFound", "Program not found."));
        }

        var year = await _context.AcademicYears.FindAsync(new object[] { request.AcademicYearId }, cancellationToken);
        if (year == null)
        {
            return Result.Failure<SectionDto>(Error.NotFound("AcademicYear.NotFound", "Academic year not found."));
        }

        var section = new Section(
            request.OrganizationId,
            request.ProgramId,
            request.AcademicYearId,
            request.Code.Trim(),
            request.Name.Trim(),
            request.MaxCapacity,
            request.StreamId,
            request.BatchId,
            request.AcademicPeriodId,
            request.CampusId)
        {
            RoomNumber = request.RoomNumber,
            ClassTeacherId = request.ClassTeacherId,
            IsActive = true
        };

        _context.Sections.Add(section);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new SectionDto(
            section.Id,
            section.OrganizationId,
            section.CampusId,
            section.ProgramId,
            program.Name,
            section.StreamId,
            null,
            section.AcademicYearId,
            year.Name,
            section.BatchId,
            null,
            section.AcademicPeriodId,
            null,
            section.Code,
            section.Name,
            section.RoomNumber,
            section.MaxCapacity,
            section.ClassTeacherId,
            section.IsActive);

        return Result.Success(dto);
    }
}

public record GetSectionsQuery(
    Guid OrganizationId, 
    Guid? ProgramId = null, 
    Guid? AcademicYearId = null, 
    Guid? StreamId = null, 
    Guid? CampusId = null) : IRequest<Result<IReadOnlyList<SectionDto>>>;

public class GetSectionsQueryHandler : IRequestHandler<GetSectionsQuery, Result<IReadOnlyList<SectionDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetSectionsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<SectionDto>>> Handle(GetSectionsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Sections
            .Include(s => s.Program)
            .Include(s => s.Stream)
            .Include(s => s.AcademicYear)
            .Include(s => s.Batch)
            .Include(s => s.AcademicPeriod)
            .AsNoTracking()
            .Where(s => s.OrganizationId == request.OrganizationId);

        if (request.ProgramId.HasValue)
        {
            query = query.Where(s => s.ProgramId == request.ProgramId.Value);
        }

        if (request.AcademicYearId.HasValue)
        {
            query = query.Where(s => s.AcademicYearId == request.AcademicYearId.Value);
        }

        if (request.StreamId.HasValue)
        {
            query = query.Where(s => s.StreamId == request.StreamId.Value);
        }

        var sections = await query
            .OrderBy(s => s.Program.Name)
            .ThenBy(s => s.Name)
            .Select(s => new SectionDto(
                s.Id,
                s.OrganizationId,
                s.CampusId,
                s.ProgramId,
                s.Program.Name,
                s.StreamId,
                s.Stream != null ? s.Stream.Name : null,
                s.AcademicYearId,
                s.AcademicYear.Name,
                s.BatchId,
                s.Batch != null ? s.Batch.Name : null,
                s.AcademicPeriodId,
                s.AcademicPeriod != null ? s.AcademicPeriod.Name : null,
                s.Code,
                s.Name,
                s.RoomNumber,
                s.MaxCapacity,
                s.ClassTeacherId,
                s.IsActive))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<SectionDto>>(sections);
    }
}
