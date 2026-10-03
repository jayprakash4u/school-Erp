using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Inventory;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Inventory;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/inventory/purchases")]
[Authorize]
public class PurchasesController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.InventoryRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<PurchaseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPurchases(
        [FromQuery] Guid? organizationId,
        [FromQuery] Guid? supplierId,
        [FromQuery] DateOnly? fromDate,
        [FromQuery] DateOnly? toDate,
        [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetPurchasesQuery(orgId.Value, supplierId, fromDate, toDate, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Purchases retrieved successfully.");
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.InventoryRead)]
    [ProducesResponseType(typeof(ApiResponse<PurchaseDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPurchaseById(Guid id)
    {
        var query = new GetPurchaseByIdQuery(id);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Purchase details retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.InventoryPurchase)]
    [ProducesResponseType(typeof(ApiResponse<PurchaseDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreatePurchase([FromBody] CreatePurchaseRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CreatePurchaseCommand(
            orgId.Value,
            request.InvoiceNumber,
            request.SupplierId,
            request.PurchaseDate,
            request.Items,
            request.TaxAmount,
            request.DiscountAmount,
            request.Remarks,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Purchase recorded and stock updated successfully.");
    }
}
