using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Communication;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Communication;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/communication/notifications")]
[Authorize]
public class NotificationsController : ApiControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<NotificationDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyNotifications([FromQuery] bool unreadOnly = false)
    {
        if (!CurrentUserGuid.HasValue)
        {
            return Unauthorized("User ID not found in session context.");
        }

        var query = new GetUserNotificationsQuery(CurrentUserGuid.Value, unreadOnly);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Notifications retrieved successfully.");
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<NotificationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateNotification(
        [FromBody] CreateNotificationRequest request,
        [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CreateNotificationCommand(
            orgId.Value,
            request.UserId,
            request.Title,
            request.Message,
            request.ActionUrl,
            request.Category,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Notification created successfully.");
    }

    [HttpPost("{id:guid}/read")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> MarkRead(Guid id)
    {
        var command = new MarkNotificationAsReadCommand(id);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Notification marked as read.");
    }
}
