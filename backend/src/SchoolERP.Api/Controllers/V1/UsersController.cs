using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Identity.Users.Commands.ChangeUserStatus;
using SchoolERP.Application.Identity.Users.Commands.CreateUser;
using SchoolERP.Application.Identity.Users.Commands.UpdateUser;
using SchoolERP.Application.Identity.Users.Queries.GetUserById;
using SchoolERP.Application.Identity.Users.Queries.GetUsers;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Identity;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/[controller]")]
[Authorize]
public class UsersController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.UsersRead)]
    [ProducesResponseType(typeof(PagedResponse<UserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUsers([FromQuery] GetUsersQuery query)
    {
        var result = await Mediator.Send(query);
        if (result.IsFailure)
        {
            return HandleResult(result);
        }

        return HandlePagedResult(result.Value, "Users retrieved successfully.");
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.UsersRead)]
    [ProducesResponseType(typeof(ApiResponse<UserDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserById([FromRoute] Guid id)
    {
        var result = await Mediator.Send(new GetUserByIdQuery(id));
        return HandleResult(result, "User details retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.UsersCreate)]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        var command = new CreateUserCommand(
            request.Email,
            request.Password,
            request.FirstName,
            request.LastName,
            request.PhoneNumber,
            request.TenantId ?? CurrentTenantId,
            request.RoleNames);

        var result = await Mediator.Send(command);
        if (result.IsFailure)
        {
            return HandleResult(result);
        }

        return CreatedAtAction(nameof(GetUserById), new { id = result.Value.Id }, ApiResponse<UserDto>.Ok(result.Value, "User created successfully."));
    }

    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.UsersUpdate)]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUser([FromRoute] Guid id, [FromBody] UpdateUserRequest request)
    {
        var command = new UpdateUserCommand(
            id,
            request.FirstName,
            request.LastName,
            request.PhoneNumber,
            request.AvatarUrl,
            request.RoleNames);

        var result = await Mediator.Send(command);
        return HandleResult(result, "User updated successfully.");
    }

    [HttpPut("{id:guid}/status")]
    [HasPermission(Permissions.UsersDelete)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ChangeUserStatus([FromRoute] Guid id, [FromBody] UpdateUserStatusRequest request)
    {
        var result = await Mediator.Send(new ChangeUserStatusCommand(id, request.IsActive));
        return HandleResult(result, $"User has been {(request.IsActive ? "activated" : "deactivated")} successfully.");
    }
}
