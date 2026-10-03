using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Organization.Commands.ChangeCampusStatus;
using SchoolERP.Application.Organization.Commands.UpdateCampus;
using SchoolERP.Application.Organization.Queries.GetCampusById;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Organization;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/[controller]")]
[Authorize]
public class CampusesController : ApiControllerBase
{
    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.CampusesRead)]
    [ProducesResponseType(typeof(ApiResponse<CampusDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCampusById([FromRoute] Guid id)
    {
        var result = await Mediator.Send(new GetCampusByIdQuery(id));
        return HandleResult(result, "Campus details retrieved successfully.");
    }

    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.CampusesManage)]
    [ProducesResponseType(typeof(ApiResponse<CampusDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCampus([FromRoute] Guid id, [FromBody] UpdateCampusRequest request)
    {
        var command = new UpdateCampusCommand(
            id,
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
        return HandleResult(result, "Campus updated successfully.");
    }

    [HttpPut("{id:guid}/status")]
    [HasPermission(Permissions.CampusesManage)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ChangeCampusStatus([FromRoute] Guid id, [FromBody] UpdateCampusStatusRequest request)
    {
        var result = await Mediator.Send(new ChangeCampusStatusCommand(id, request.IsActive));
        return HandleResult(result, $"Campus has been {(request.IsActive ? "activated" : "deactivated")} successfully.");
    }
}
