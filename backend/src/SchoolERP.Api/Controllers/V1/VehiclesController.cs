using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Transport;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Transport;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/transport/vehicles")]
[Authorize]
public class VehiclesController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.TransportRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<VehicleDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetVehicles(
        [FromQuery] Guid? organizationId,
        [FromQuery] Guid? campusId,
        [FromQuery] bool activeOnly = true)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetVehiclesQuery(orgId.Value, campusId ?? CurrentCampusId, activeOnly);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Vehicles retrieved successfully.");
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.TransportRead)]
    [ProducesResponseType(typeof(ApiResponse<VehicleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetVehicleById(Guid id)
    {
        var query = new GetVehicleByIdQuery(id);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Vehicle retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.TransportManage)]
    [ProducesResponseType(typeof(ApiResponse<VehicleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateVehicle(
        [FromBody] CreateVehicleRequest request,
        [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CreateVehicleCommand(
            orgId.Value,
            request.RegistrationNumber,
            request.VehicleType,
            request.Model,
            request.Capacity,
            request.AssignedDriverId,
            request.GPSDeviceNumber,
            request.InsuranceExpiryDate,
            request.FitnessCertExpiryDate,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Vehicle created successfully.");
    }

    [HttpPost("{id:guid}/assign-driver")]
    [HasPermission(Permissions.TransportManage)]
    [ProducesResponseType(typeof(ApiResponse<VehicleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AssignDriver(
        Guid id,
        [FromBody] AssignDriverRequest request)
    {
        var command = new AssignDriverToVehicleCommand(id, request.DriverId);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Driver assigned to vehicle successfully.");
    }
}
