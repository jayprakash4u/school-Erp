using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Organization;

namespace SchoolERP.Application.Organization.Queries.GetCampusById;

public record GetCampusByIdQuery(Guid Id) : IRequest<Result<CampusDto>>;

public class GetCampusByIdQueryHandler : IRequestHandler<GetCampusByIdQuery, Result<CampusDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCampusByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CampusDto>> Handle(GetCampusByIdQuery request, CancellationToken cancellationToken)
    {
        var c = await _context.Campuses
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (c == null)
        {
            return Result.Failure<CampusDto>(Error.NotFound("Campus.NotFound", $"Campus with ID {request.Id} was not found."));
        }

        var dto = new CampusDto(
            c.Id,
            c.OrganizationId,
            c.Code,
            c.Name,
            c.Address,
            c.City,
            c.State,
            c.Country,
            c.PostalCode,
            c.Phone,
            c.Email,
            c.IsMainCampus,
            c.IsActive,
            c.CreatedAtUtc);

        return Result.Success(dto);
    }
}
