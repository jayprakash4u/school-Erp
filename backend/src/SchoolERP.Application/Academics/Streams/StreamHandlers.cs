using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Academics;
using StreamEntity = SchoolERP.Domain.Entities.Academics.Stream;

namespace SchoolERP.Application.Academics.Streams;

public record CreateStreamCommand(
    Guid ProgramId,
    string Code,
    string Name,
    string? Description = null) : IRequest<Result<StreamDto>>;

public class CreateStreamCommandValidator : AbstractValidator<CreateStreamCommand>
{
    public CreateStreamCommandValidator()
    {
        RuleFor(x => x.ProgramId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
    }
}

public class CreateStreamCommandHandler : IRequestHandler<CreateStreamCommand, Result<StreamDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateStreamCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<StreamDto>> Handle(CreateStreamCommand request, CancellationToken cancellationToken)
    {
        var program = await _context.Programs.FindAsync(new object[] { request.ProgramId }, cancellationToken);
        if (program == null)
        {
            return Result.Failure<StreamDto>(Error.NotFound("Program.NotFound", "Program not found."));
        }

        var stream = new StreamEntity(request.ProgramId, request.Code.Trim(), request.Name.Trim(), request.Description);
        _context.Streams.Add(stream);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new StreamDto(stream.Id, stream.ProgramId, stream.Code, stream.Name, stream.Description, stream.IsActive);
        return Result.Success(dto);
    }
}

public record GetStreamsByProgramQuery(Guid ProgramId) : IRequest<Result<IReadOnlyList<StreamDto>>>;

public class GetStreamsByProgramQueryHandler : IRequestHandler<GetStreamsByProgramQuery, Result<IReadOnlyList<StreamDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetStreamsByProgramQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<StreamDto>>> Handle(GetStreamsByProgramQuery request, CancellationToken cancellationToken)
    {
        var streams = await _context.Streams
            .AsNoTracking()
            .Where(s => s.ProgramId == request.ProgramId)
            .OrderBy(s => s.Name)
            .Select(s => new StreamDto(s.Id, s.ProgramId, s.Code, s.Name, s.Description, s.IsActive))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<StreamDto>>(streams);
    }
}
