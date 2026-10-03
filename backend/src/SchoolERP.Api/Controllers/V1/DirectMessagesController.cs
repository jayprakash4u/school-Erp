using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Communication;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Communication;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/communication/messages")]
[Authorize]
public class DirectMessagesController : ApiControllerBase
{
    [HttpGet("inbox")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<DirectMessageDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetInbox()
    {
        if (!CurrentUserGuid.HasValue)
        {
            return Unauthorized("User ID not found in session context.");
        }

        var query = new GetUserInboxQuery(CurrentUserGuid.Value);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Inbox messages retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.MessagesSend)]
    [ProducesResponseType(typeof(ApiResponse<DirectMessageDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SendMessage(
        [FromBody] SendDirectMessageRequest request,
        [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        if (!CurrentUserGuid.HasValue)
        {
            return Unauthorized("User ID not found in session context.");
        }

        var command = new SendDirectMessageCommand(
            orgId.Value,
            CurrentUserGuid.Value,
            request.RecipientUserId,
            request.Subject,
            request.Content,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Direct message sent successfully.");
    }
}
