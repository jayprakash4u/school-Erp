using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Identity;

namespace SchoolERP.Application.Identity.Users.Queries.GetUsers;

public class GetUsersQuery : PaginationParams, IRequest<Result<PagedList<UserDto>>>
{
    public string? Role { get; set; }
    public bool? IsActive { get; set; }
    public string? TenantId { get; set; }
}

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, Result<PagedList<UserDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetUsersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedList<UserDto>>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.TenantId))
        {
            query = query.Where(u => u.TenantId == request.TenantId);
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(u => u.IsActive == request.IsActive.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            query = query.Where(u => u.UserRoles.Any(ur => ur.Role.Name == request.Role));
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var search = request.SearchTerm.Trim().ToLower();
            query = query.Where(u => 
                u.FirstName.ToLower().Contains(search) || 
                u.LastName.ToLower().Contains(search) || 
                u.Email.ToLower().Contains(search) ||
                (u.PhoneNumber != null && u.PhoneNumber.Contains(search)));
        }

        // Sorting
        query = request.SortBy?.ToLower() switch
        {
            "firstname" => request.SortDescending ? query.OrderByDescending(u => u.FirstName) : query.OrderBy(u => u.FirstName),
            "lastname" => request.SortDescending ? query.OrderByDescending(u => u.LastName) : query.OrderBy(u => u.LastName),
            "email" => request.SortDescending ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
            "createdat" => request.SortDescending ? query.OrderByDescending(u => u.CreatedAtUtc) : query.OrderBy(u => u.CreatedAtUtc),
            _ => query.OrderByDescending(u => u.CreatedAtUtc)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var users = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(u => new UserDto(
                u.Id,
                u.Email,
                u.FirstName,
                u.LastName,
                u.FullName,
                u.PhoneNumber,
                u.AvatarUrl,
                u.IsActive,
                u.EmailConfirmed,
                u.TenantId,
                u.LastLoginAtUtc,
                u.UserRoles.Select(ur => ur.Role.Name).ToList()))
            .ToListAsync(cancellationToken);

        var pagedList = new PagedList<UserDto>(users, totalCount, request.PageNumber, request.PageSize);
        return Result.Success(pagedList);
    }
}
