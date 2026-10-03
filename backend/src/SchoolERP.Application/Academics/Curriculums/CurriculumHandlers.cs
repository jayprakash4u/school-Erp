using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Academics;
using SchoolERP.Domain.Entities.Academics;

namespace SchoolERP.Application.Academics.Curriculums;

public record CreateCurriculumCommand(
    Guid OrganizationId,
    string Code,
    string Name,
    string BoardOrAffiliation,
    string? Version = null,
    string? Description = null,
    Guid? CampusId = null) : IRequest<Result<CurriculumDto>>;

public class CreateCurriculumCommandValidator : AbstractValidator<CreateCurriculumCommand>
{
    public CreateCurriculumCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.BoardOrAffiliation).NotEmpty().MaximumLength(100);
    }
}

public class CreateCurriculumCommandHandler : IRequestHandler<CreateCurriculumCommand, Result<CurriculumDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateCurriculumCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CurriculumDto>> Handle(CreateCurriculumCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.Curriculums
            .AnyAsync(c => c.OrganizationId == request.OrganizationId && c.Code == request.Code.Trim(), cancellationToken);

        if (exists)
        {
            return Result.Failure<CurriculumDto>(Error.Conflict("Curriculum.DuplicateCode", $"Curriculum with code '{request.Code}' already exists."));
        }

        var curriculum = new Curriculum(
            request.OrganizationId,
            request.Code.Trim(),
            request.Name.Trim(),
            request.BoardOrAffiliation.Trim(),
            request.Version,
            request.CampusId)
        {
            Description = request.Description,
            IsActive = true
        };

        _context.Curriculums.Add(curriculum);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new CurriculumDto(
            curriculum.Id,
            curriculum.OrganizationId,
            curriculum.CampusId,
            curriculum.Code,
            curriculum.Name,
            curriculum.BoardOrAffiliation,
            curriculum.Version,
            curriculum.Description,
            curriculum.IsActive,
            0);

        return Result.Success(dto);
    }
}

public record AssignCurriculumSubjectCommand(
    Guid CurriculumId,
    Guid ProgramId,
    Guid SubjectId,
    Guid? StreamId = null,
    Guid? AcademicPeriodId = null,
    bool IsMandatory = true,
    decimal Credits = 1.0m,
    int SequenceOrder = 1) : IRequest<Result<CurriculumSubjectDto>>;

public class AssignCurriculumSubjectCommandHandler : IRequestHandler<AssignCurriculumSubjectCommand, Result<CurriculumSubjectDto>>
{
    private readonly IApplicationDbContext _context;

    public AssignCurriculumSubjectCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CurriculumSubjectDto>> Handle(AssignCurriculumSubjectCommand request, CancellationToken cancellationToken)
    {
        var curriculum = await _context.Curriculums.FindAsync(new object[] { request.CurriculumId }, cancellationToken);
        if (curriculum == null)
        {
            return Result.Failure<CurriculumSubjectDto>(Error.NotFound("Curriculum.NotFound", "Curriculum not found."));
        }

        var program = await _context.Programs.FindAsync(new object[] { request.ProgramId }, cancellationToken);
        if (program == null)
        {
            return Result.Failure<CurriculumSubjectDto>(Error.NotFound("Program.NotFound", "Program not found."));
        }

        var subject = await _context.Subjects.FindAsync(new object[] { request.SubjectId }, cancellationToken);
        if (subject == null)
        {
            return Result.Failure<CurriculumSubjectDto>(Error.NotFound("Subject.NotFound", "Subject not found."));
        }

        var item = new CurriculumSubject(
            request.CurriculumId,
            request.ProgramId,
            request.SubjectId,
            request.IsMandatory,
            request.Credits,
            request.StreamId,
            request.AcademicPeriodId,
            request.SequenceOrder);

        _context.CurriculumSubjects.Add(item);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new CurriculumSubjectDto(
            item.Id,
            item.CurriculumId,
            item.ProgramId,
            program.Name,
            item.StreamId,
            null,
            item.AcademicPeriodId,
            null,
            item.SubjectId,
            subject.Code,
            subject.Name,
            subject.Type,
            item.IsMandatory,
            item.Credits,
            item.SequenceOrder);

        return Result.Success(dto);
    }
}

public record GetCurriculumsQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<IReadOnlyList<CurriculumDto>>>;

public class GetCurriculumsQueryHandler : IRequestHandler<GetCurriculumsQuery, Result<IReadOnlyList<CurriculumDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetCurriculumsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<CurriculumDto>>> Handle(GetCurriculumsQuery request, CancellationToken cancellationToken)
    {
        var curriculums = await _context.Curriculums
            .Include(c => c.CurriculumSubjects)
            .AsNoTracking()
            .Where(c => c.OrganizationId == request.OrganizationId)
            .OrderBy(c => c.Name)
            .Select(c => new CurriculumDto(
                c.Id,
                c.OrganizationId,
                c.CampusId,
                c.Code,
                c.Name,
                c.BoardOrAffiliation,
                c.Version,
                c.Description,
                c.IsActive,
                c.CurriculumSubjects.Count))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<CurriculumDto>>(curriculums);
    }
}

public record GetCurriculumStructureQuery(Guid CurriculumId) : IRequest<Result<CurriculumStructureDto>>;

public class GetCurriculumStructureQueryHandler : IRequestHandler<GetCurriculumStructureQuery, Result<CurriculumStructureDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCurriculumStructureQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CurriculumStructureDto>> Handle(GetCurriculumStructureQuery request, CancellationToken cancellationToken)
    {
        var c = await _context.Curriculums
            .Include(c => c.CurriculumSubjects)
                .ThenInclude(cs => cs.Program)
            .Include(c => c.CurriculumSubjects)
                .ThenInclude(cs => cs.Subject)
            .Include(c => c.CurriculumSubjects)
                .ThenInclude(cs => cs.Stream)
            .Include(c => c.CurriculumSubjects)
                .ThenInclude(cs => cs.AcademicPeriod)
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == request.CurriculumId, cancellationToken);

        if (c == null)
        {
            return Result.Failure<CurriculumStructureDto>(Error.NotFound("Curriculum.NotFound", "Curriculum not found."));
        }

        var subjectDtos = c.CurriculumSubjects
            .OrderBy(cs => cs.SequenceOrder)
            .Select(cs => new CurriculumSubjectDto(
                cs.Id,
                cs.CurriculumId,
                cs.ProgramId,
                cs.Program.Name,
                cs.StreamId,
                cs.Stream != null ? cs.Stream.Name : null,
                cs.AcademicPeriodId,
                cs.AcademicPeriod != null ? cs.AcademicPeriod.Name : null,
                cs.SubjectId,
                cs.Subject.Code,
                cs.Subject.Name,
                cs.Subject.Type,
                cs.IsMandatory,
                cs.Credits,
                cs.SequenceOrder))
            .ToList();

        var structure = new CurriculumStructureDto(
            c.Id,
            c.Code,
            c.Name,
            c.BoardOrAffiliation,
            c.Version,
            subjectDtos);

        return Result.Success(structure);
    }
}
