using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Inventory;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Inventory;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/inventory/items")]
[Authorize]
public class ItemsController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.InventoryRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ItemDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetItems(
        [FromQuery] Guid? organizationId,
        [FromQuery] Guid? categoryId,
        [FromQuery] bool? lowStockOnly,
        [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetItemsQuery(orgId.Value, categoryId, lowStockOnly, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Items retrieved successfully.");
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.InventoryRead)]
    [ProducesResponseType(typeof(ApiResponse<ItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetItemById(Guid id)
    {
        var query = new GetItemByIdQuery(id);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Item retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.InventoryManage)]
    [ProducesResponseType(typeof(ApiResponse<ItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateItem([FromBody] CreateItemRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CreateItemCommand(
            orgId.Value,
            request.CategoryId,
            request.Code,
            request.Name,
            request.ItemType,
            request.UnitOfMeasure,
            request.UnitPrice,
            request.MinimumStockAlert,
            request.Description,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Item created successfully.");
    }
}
