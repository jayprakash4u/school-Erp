using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Inventory;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Inventory;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/inventory/stock")]
[Authorize]
public class InventoryStockController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.InventoryRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<StockDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStockList(
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

        var query = new GetStockListQuery(orgId.Value, categoryId, lowStockOnly, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Inventory stock retrieved successfully.");
    }

    [HttpGet("items/{itemId:guid}")]
    [HasPermission(Permissions.InventoryRead)]
    [ProducesResponseType(typeof(ApiResponse<StockDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStockByItemId(Guid itemId)
    {
        var query = new GetStockByItemIdQuery(itemId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Item stock retrieved successfully.");
    }

    [HttpPost("adjust")]
    [HasPermission(Permissions.InventoryManage)]
    [ProducesResponseType(typeof(ApiResponse<StockDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AdjustStock([FromBody] AdjustStockRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new AdjustStockCommand(
            orgId.Value,
            request.ItemId,
            request.QuantityAdjustment,
            request.Reason,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Stock adjusted successfully.");
    }

    [HttpGet("transactions")]
    [HasPermission(Permissions.InventoryRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<StockTransactionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStockTransactions(
        [FromQuery] Guid? organizationId,
        [FromQuery] Guid? itemId,
        [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetStockTransactionsQuery(orgId.Value, itemId, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Stock transactions retrieved successfully.");
    }
}
