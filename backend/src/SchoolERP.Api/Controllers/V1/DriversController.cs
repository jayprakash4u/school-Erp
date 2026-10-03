using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Transport;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Transport;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/transport/drivers")]
[Authorize]
public class DriversController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.TransportRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<DriverDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDrivers(
        [FromQuery] Guid? organizationId,
        [FromQuery] Guid? campusId,
        [FromQuery] bool activeOnly = true)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetDriversQuery(orgId.Value, campusId ?? CurrentCampusId, activeOnly);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Drivers retrieved successfully.");
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.TransportRead)]
    [ProducesResponseType(typeof(ApiResponse<DriverDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDriverById(Guid id)
    {
        var query = new GetDriverByIdQuery(id);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Driver retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.TransportManage)]
    [ProducesResponseType(typeof(ApiResponse<DriverDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateDriver(
        [FromBody] CreateDriverRequest request,
        [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CreateDriverCommand(
            orgId.Value,
            request.FullName,
            request.LicenseNumber,
            request.LicenseExpiryDate,
            request.ContactNumber,
            request.EmergencyContact,
            request.ExperienceYears,
            request.StaffId,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Driver created successfully.");
    }
}
