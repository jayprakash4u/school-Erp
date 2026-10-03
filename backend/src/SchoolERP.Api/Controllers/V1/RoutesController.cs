using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Transport;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Transport;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/transport/routes")]
[Authorize]
public class RoutesController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.TransportRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<RouteDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRoutes(
        [FromQuery] Guid? organizationId,
        [FromQuery] Guid? campusId,
        [FromQuery] bool activeOnly = true)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetRoutesQuery(orgId.Value, campusId ?? CurrentCampusId, activeOnly);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Routes retrieved successfully.");
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.TransportRead)]
    [ProducesResponseType(typeof(ApiResponse<RouteDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRouteById(Guid id)
    {
        var query = new GetRouteByIdQuery(id);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Route details retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.TransportManage)]
    [ProducesResponseType(typeof(ApiResponse<RouteDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateRoute(
        [FromBody] CreateRouteRequest request,
        [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CreateRouteCommand(
            orgId.Value,
            request.Code,
            request.Name,
            request.StartLocation,
            request.EndLocation,
            request.EstimatedDurationMinutes,
            request.Stops,
            request.VehicleId,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Route created successfully.");
    }

    [HttpPost("{id:guid}/assign-vehicle")]
    [HasPermission(Permissions.TransportManage)]
    [ProducesResponseType(typeof(ApiResponse<RouteDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AssignVehicle(
        Guid id,
        [FromBody] AssignVehicleRequest request)
    {
        var command = new AssignVehicleToRouteCommand(id, request.VehicleId);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Vehicle assigned to route successfully.");
    }

    [HttpGet("{id:guid}/passengers")]
    [HasPermission(Permissions.TransportRead)]
    [ProducesResponseType(typeof(ApiResponse<RoutePassengerRosterDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPassengerRoster(Guid id)
    {
        var query = new GetRoutePassengerRosterQuery(id);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Passenger roster retrieved successfully.");
    }
}
