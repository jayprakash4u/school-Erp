using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Hostel;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Hostel;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/hostel-rooms")]
[Authorize]
public class HostelRoomsController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.HostelRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<RoomDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRooms(
        [FromQuery] Guid? floorId,
        [FromQuery] Guid? hostelId)
    {
        var query = new GetRoomsQuery(floorId, hostelId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Rooms retrieved successfully.");
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.HostelRead)]
    [ProducesResponseType(typeof(ApiResponse<RoomDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRoomById(Guid id)
    {
        var query = new GetRoomByIdQuery(id);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Room retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.HostelManage)]
    [ProducesResponseType(typeof(ApiResponse<RoomDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateRoom(
        [FromBody] CreateRoomRequest request)
    {
        var command = new CreateRoomCommand(
            request.FloorId,
            request.RoomNumber,
            request.RoomType,
            request.MonthlyFeeAmount,
            request.Capacity,
            request.InitialBedsCount,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Room created successfully.");
    }

    [HttpPost("{id:guid}/beds")]
    [HasPermission(Permissions.HostelManage)]
    [ProducesResponseType(typeof(ApiResponse<BedDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateBed(
        Guid id,
        [FromBody] CreateBedRequest request)
    {
        var command = new CreateBedCommand(
            id,
            request.BedNumber,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Bed created successfully.");
    }

    [HttpGet("buildings/{buildingId:guid}/floors")]
    [HasPermission(Permissions.HostelRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<FloorDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFloors(Guid buildingId)
    {
        var query = new GetFloorsQuery(buildingId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Floors retrieved successfully.");
    }

    [HttpPost("buildings/{buildingId:guid}/floors")]
    [HasPermission(Permissions.HostelManage)]
    [ProducesResponseType(typeof(ApiResponse<FloorDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateFloor(
        Guid buildingId,
        [FromBody] CreateFloorRequest request)
    {
        var command = new CreateFloorCommand(
            buildingId,
            request.FloorNumber,
            request.FloorName,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Floor created successfully.");
    }
}
