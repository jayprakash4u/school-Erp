using System.Security.Claims;

namespace SchoolERP.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(
        string userId, 
        string email, 
        string? role = null, 
        IEnumerable<string>? roles = null, 
        IEnumerable<string>? permissions = null, 
        string? tenantId = null);

    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}
