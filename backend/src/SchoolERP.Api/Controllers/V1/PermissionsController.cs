using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Identity.Roles.Queries.GetPermissions;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Identity;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/[controller]")]
[Authorize]
public class PermissionsController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.PermissionsRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<PermissionGroupDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPermissions()
    {
        var result = await Mediator.Send(new GetPermissionsQuery());
        return HandleResult(result, "Permissions retrieved successfully.");
    }
}
