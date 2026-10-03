using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Identity.Roles.Commands.CreateRole;
using SchoolERP.Application.Identity.Roles.Commands.UpdateRolePermissions;
using SchoolERP.Application.Identity.Roles.Queries.GetRoleById;
using SchoolERP.Application.Identity.Roles.Queries.GetRoles;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Identity;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/[controller]")]
[Authorize]
public class RolesController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.RolesRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<RoleDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRoles([FromQuery] string? tenantId = null)
    {
        var result = await Mediator.Send(new GetRolesQuery(tenantId ?? CurrentTenantId));
        return HandleResult(result, "Roles retrieved successfully.");
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.RolesRead)]
    [ProducesResponseType(typeof(ApiResponse<RoleDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRoleById([FromRoute] Guid id)
    {
        var result = await Mediator.Send(new GetRoleByIdQuery(id));
        return HandleResult(result, "Role details retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.RolesManage)]
    [ProducesResponseType(typeof(ApiResponse<RoleDetailDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest request)
    {
        var command = new CreateRoleCommand(
            request.Name,
            request.Description,
            request.TenantId ?? CurrentTenantId,
            request.PermissionCodes);

        var result = await Mediator.Send(command);
        if (result.IsFailure)
        {
            return HandleResult(result);
        }

        return CreatedAtAction(nameof(GetRoleById), new { id = result.Value.Id }, ApiResponse<RoleDetailDto>.Ok(result.Value, "Role created successfully."));
    }

    [HttpPut("{id:guid}/permissions")]
    [HasPermission(Permissions.RolesManage)]
    [ProducesResponseType(typeof(ApiResponse<RoleDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateRolePermissions([FromRoute] Guid id, [FromBody] UpdateRolePermissionsRequest request)
    {
        var command = new UpdateRolePermissionsCommand(id, request.PermissionCodes);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Role permissions updated successfully.");
    }
}
