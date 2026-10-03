using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using SchoolERP.Application.Common.Interfaces;

namespace SchoolERP.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public string? UserId =>
        User?.FindFirstValue(ClaimTypes.NameIdentifier) ??
        User?.FindFirstValue(JwtRegisteredClaimNames.Sub) ??
        User?.FindFirstValue("sub") ??
        User?.FindFirstValue("id");

    public string? Email =>
        User?.FindFirstValue(ClaimTypes.Email) ??
        User?.FindFirstValue(JwtRegisteredClaimNames.Email) ??
        User?.FindFirstValue("email");

    public string? Role =>
        User?.FindFirstValue(ClaimTypes.Role) ??
        User?.FindFirstValue("role");

    public IReadOnlyList<string> Roles =>
        User?.FindAll(ClaimTypes.Role).Concat(User.FindAll("role"))
            .Select(c => c.Value)
            .Distinct()
            .ToList() ?? new List<string>();

    public IReadOnlyList<string> Permissions =>
        User?.FindAll("permission")
            .Select(c => c.Value)
            .Distinct()
            .ToList() ?? new List<string>();

    public string? TenantId =>
        User?.FindFirstValue("tenant_id") ??
        User?.FindFirstValue("TenantId") ??
        _httpContextAccessor.HttpContext?.Request.Headers["X-Tenant-ID"].FirstOrDefault();

    public Guid? OrganizationId
    {
        get
        {
            var raw = User?.FindFirstValue("org_id") ??
                      User?.FindFirstValue("OrganizationId") ??
                      _httpContextAccessor.HttpContext?.Request.Headers["X-Organization-ID"].FirstOrDefault();

            return Guid.TryParse(raw, out var orgId) ? orgId : null;
        }
    }

    public Guid? CampusId
    {
        get
        {
            var raw = User?.FindFirstValue("campus_id") ??
                      User?.FindFirstValue("CampusId") ??
                      _httpContextAccessor.HttpContext?.Request.Headers["X-Campus-ID"].FirstOrDefault();

            return Guid.TryParse(raw, out var campusId) ? campusId : null;
        }
    }

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;

    public bool HasPermission(string permission)
    {
        return Permissions.Contains(permission, StringComparer.OrdinalIgnoreCase);
    }

    public bool IsInRole(string role)
    {
        return Roles.Contains(role, StringComparer.OrdinalIgnoreCase);
    }
}
