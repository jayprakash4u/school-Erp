using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Identity;

namespace SchoolERP.Application.Identity.Users.Queries.GetUserById;

public record GetUserByIdQuery(Guid Id) : IRequest<Result<UserDetailDto>>;

public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, Result<UserDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public GetUserByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<UserDetailDto>> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken);

        if (user == null)
        {
            return Result.Failure<UserDetailDto>(Error.NotFound("User.NotFound", $"User with ID {request.Id} was not found."));
        }

        var roles = user.UserRoles.Select(ur => ur.Role.Name).Distinct().ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions.Select(rp => rp.Permission.Code))
            .Distinct()
            .ToList();

        var dto = new UserDetailDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.FullName,
            user.PhoneNumber,
            user.AvatarUrl,
            user.IsActive,
            user.EmailConfirmed,
            user.TenantId,
            user.LastLoginAtUtc,
            user.CreatedAtUtc,
            roles,
            permissions);

        return Result.Success(dto);
    }
}
