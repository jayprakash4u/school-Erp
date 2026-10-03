using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Organization.Commands.AssignUserToOrg;
using SchoolERP.Application.Organization.Commands.ChangeOrganizationStatus;
using SchoolERP.Application.Organization.Commands.CreateCampus;
using SchoolERP.Application.Organization.Commands.CreateOrganization;
using SchoolERP.Application.Organization.Commands.UpdateOrganization;
using SchoolERP.Application.Organization.Queries.GetCampusesByOrg;
using SchoolERP.Application.Organization.Queries.GetOrganizationById;
using SchoolERP.Application.Organization.Queries.GetOrganizations;
using SchoolERP.Application.Organization.Queries.GetOrgUsers;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Organization;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/[controller]")]
[Authorize]
public class OrganizationsController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.OrganizationsRead)]
    [ProducesResponseType(typeof(PagedResponse<OrganizationDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOrganizations([FromQuery] GetOrganizationsQuery query)
    {
        var result = await Mediator.Send(query);
        if (result.IsFailure)
        {
            return HandleResult(result);
        }

        return HandlePagedResult(result.Value, "Organizations retrieved successfully.");
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.OrganizationsRead)]
    [ProducesResponseType(typeof(ApiResponse<OrganizationDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrganizationById([FromRoute] Guid id)
    {
        var result = await Mediator.Send(new GetOrganizationByIdQuery(id));
        return HandleResult(result, "Organization details retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.OrganizationsManage)]
    [ProducesResponseType(typeof(ApiResponse<OrganizationDetailDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateOrganization([FromBody] CreateOrganizationRequest request)
    {
        var command = new CreateOrganizationCommand(
            request.Code,
            request.Name,
            request.Type,
            request.Description,
            request.Email,
            request.Phone,
            request.Address,
            request.City,
            request.State,
            request.Country,
            request.PostalCode,
            request.Website,
            request.LogoUrl,
            request.Currency,
            request.TimeZone,
            request.ParentOrganizationId,
            request.InitialCampusName);

        var result = await Mediator.Send(command);
        if (result.IsFailure)
        {
            return HandleResult(result);
        }

        return CreatedAtAction(nameof(GetOrganizationById), new { id = result.Value.Id }, ApiResponse<OrganizationDetailDto>.Ok(result.Value, "Organization created successfully."));
    }

    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.OrganizationsManage)]
    [ProducesResponseType(typeof(ApiResponse<OrganizationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateOrganization([FromRoute] Guid id, [FromBody] UpdateOrganizationRequest request)
    {
        var command = new UpdateOrganizationCommand(
            id,
            request.Name,
            request.Type,
            request.Description,
            request.Email,
            request.Phone,
            request.Address,
            request.City,
            request.State,
            request.Country,
            request.PostalCode,
            request.Website,
            request.LogoUrl,
            request.Currency,
            request.TimeZone);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Organization updated successfully.");
    }

    [HttpPut("{id:guid}/status")]
    [HasPermission(Permissions.OrganizationsManage)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ChangeOrganizationStatus([FromRoute] Guid id, [FromBody] UpdateOrganizationStatusRequest request)
    {
        var result = await Mediator.Send(new ChangeOrganizationStatusCommand(id, request.IsActive));
        return HandleResult(result, $"Organization has been {(request.IsActive ? "activated" : "deactivated")} successfully.");
    }

    [HttpGet("{orgId:guid}/campuses")]
    [HasPermission(Permissions.CampusesRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<CampusDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCampuses([FromRoute] Guid orgId, [FromQuery] bool? isActive = null)
    {
        var result = await Mediator.Send(new GetCampusesByOrgQuery(orgId, isActive));
        return HandleResult(result, "Campuses retrieved successfully.");
    }

    [HttpPost("{orgId:guid}/campuses")]
    [HasPermission(Permissions.CampusesManage)]
    [ProducesResponseType(typeof(ApiResponse<CampusDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCampus([FromRoute] Guid orgId, [FromBody] CreateCampusRequest request)
    {
        var command = new CreateCampusCommand(
            orgId,
            request.Code,
            request.Name,
            request.Address,
            request.City,
            request.State,
            request.Country,
            request.PostalCode,
            request.Phone,
            request.Email,
            request.IsMainCampus);

        var result = await Mediator.Send(command);
        if (result.IsFailure)
        {
            return HandleResult(result);
        }

        return CreatedAtAction("GetCampusById", "Campuses", new { id = result.Value.Id }, ApiResponse<CampusDto>.Ok(result.Value, "Campus created successfully."));
    }

    [HttpGet("{orgId:guid}/users")]
    [HasPermission(Permissions.UsersRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<OrganizationUserDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOrganizationUsers([FromRoute] Guid orgId, [FromQuery] Guid? campusId = null)
    {
        var result = await Mediator.Send(new GetOrgUsersQuery(orgId, campusId));
        return HandleResult(result, "Organization users retrieved successfully.");
    }

    [HttpPost("{orgId:guid}/users")]
    [HasPermission(Permissions.UsersUpdate)]
    [ProducesResponseType(typeof(ApiResponse<OrganizationUserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AssignUserToOrganization([FromRoute] Guid orgId, [FromBody] AssignUserToOrgRequest request)
    {
        var command = new AssignUserToOrgCommand(orgId, request.UserId, request.CampusId, request.IsPrimary);
        var result = await Mediator.Send(command);
        return HandleResult(result, "User assigned to organization successfully.");
    }
}
