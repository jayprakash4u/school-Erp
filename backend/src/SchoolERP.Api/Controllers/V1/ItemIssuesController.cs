using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Inventory;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Inventory;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/inventory/issues")]
[Authorize]
public class ItemIssuesController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.InventoryRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ItemIssueDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetIssues(
        [FromQuery] Guid? organizationId,
        [FromQuery] Guid? itemId,
        [FromQuery] IssueTargetType? targetType,
        [FromQuery] bool? pendingReturnOnly,
        [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetItemIssuesQuery(orgId.Value, itemId, targetType, pendingReturnOnly, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Item issues retrieved successfully.");
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.InventoryRead)]
    [ProducesResponseType(typeof(ApiResponse<ItemIssueDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetIssueById(Guid id)
    {
        var query = new GetItemIssueByIdQuery(id);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Item issue retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.InventoryIssue)]
    [ProducesResponseType(typeof(ApiResponse<ItemIssueDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> IssueItem([FromBody] IssueItemRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var userId = CurrentUserGuid ?? Guid.Empty;

        var command = new IssueItemCommand(
            orgId.Value,
            request.ItemId,
            request.Quantity,
            request.TargetType,
            userId,
            DateOnly.FromDateTime(DateTime.UtcNow),
            request.TargetEntityId,
            request.TargetDisplayName,
            request.ExpectedReturnDate,
            request.Remarks,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Item issued successfully.");
    }

    [HttpPost("returns")]
    [HasPermission(Permissions.InventoryIssue)]
    [ProducesResponseType(typeof(ApiResponse<ItemReturnDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ReturnItem([FromBody] ReturnItemRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var userId = CurrentUserGuid ?? Guid.Empty;

        var command = new ReturnItemCommand(
            orgId.Value,
            request.ItemIssueId,
            request.Quantity,
            request.Condition,
            userId,
            DateOnly.FromDateTime(DateTime.UtcNow),
            request.Remarks,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Item returned and stock updated successfully.");
    }

    [HttpGet("returns")]
    [HasPermission(Permissions.InventoryRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ItemReturnDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReturns(
        [FromQuery] Guid? organizationId,
        [FromQuery] Guid? itemIssueId,
        [FromQuery] Guid? itemId,
        [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetItemReturnsQuery(orgId.Value, itemIssueId, itemId, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Item returns retrieved successfully.");
    }
}
