using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Hostel;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Hostel;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/hostels")]
[Authorize]
public class HostelsController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.HostelRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<HostelDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetHostels(
        [FromQuery] Guid? organizationId,
        [FromQuery] Guid? campusId,
        [FromQuery] bool activeOnly = true)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetHostelsQuery(orgId.Value, campusId ?? CurrentCampusId, activeOnly);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Hostels retrieved successfully.");
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.HostelRead)]
    [ProducesResponseType(typeof(ApiResponse<HostelDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetHostelById(Guid id)
    {
        var query = new GetHostelByIdQuery(id);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Hostel retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.HostelManage)]
    [ProducesResponseType(typeof(ApiResponse<HostelDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateHostel(
        [FromBody] CreateHostelRequest request,
        [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CreateHostelCommand(
            orgId.Value,
            request.Code,
            request.Name,
            request.HostelType,
            request.Address,
            request.WardenStaffId,
            request.WardenContactNumber,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Hostel created successfully.");
    }

    [HttpGet("{id:guid}/buildings")]
    [HasPermission(Permissions.HostelRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<BuildingDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBuildings(Guid id)
    {
        var query = new GetBuildingsQuery(id);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Buildings retrieved successfully.");
    }

    [HttpPost("{id:guid}/buildings")]
    [HasPermission(Permissions.HostelManage)]
    [ProducesResponseType(typeof(ApiResponse<BuildingDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateBuilding(
        Guid id,
        [FromBody] CreateBuildingRequest request)
    {
        var command = new CreateBuildingCommand(
            id,
            request.Code,
            request.Name,
            request.TotalFloors,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Building created successfully.");
    }

    [HttpGet("{id:guid}/attendance-roster")]
    [HasPermission(Permissions.HostelAttendance)]
    [ProducesResponseType(typeof(ApiResponse<HostelAttendanceRosterDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAttendanceRoster(
        Guid id,
        [FromQuery] DateOnly? date)
    {
        var targetDate = date ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var query = new GetHostelAttendanceRosterQuery(id, targetDate);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Hostel attendance roster retrieved successfully.");
    }

    [HttpPost("{id:guid}/attendance")]
    [HasPermission(Permissions.HostelAttendance)]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> MarkAttendance(
        Guid id,
        [FromBody] MarkHostelAttendanceRequest request)
    {
        var command = new MarkHostelAttendanceCommand(
            id,
            request.Date,
            request.AttendanceList,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Hostel attendance marked successfully.");
    }
}
