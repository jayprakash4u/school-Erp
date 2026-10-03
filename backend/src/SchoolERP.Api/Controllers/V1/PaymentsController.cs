using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Fees;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Fees;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/payments")]
[Authorize]
public class PaymentsController : ApiControllerBase
{
    [HttpPost("collect")]
    [HasPermission(Permissions.FeesCollect)]
    [ProducesResponseType(typeof(ApiResponse<PaymentReceiptDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CollectPayment([FromBody] CollectPaymentRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CollectPaymentCommand(
            orgId.Value,
            request.StudentId,
            request.Amount,
            request.PaymentMethod,
            request.IdempotencyKey,
            request.InvoiceId,
            request.PaymentDate,
            request.TransactionReference,
            request.CollectedByStaffId,
            request.Remarks,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Payment processed and receipt issued successfully.");
    }

    [HttpGet("receipt/{receiptId:guid}")]
    [HasPermission(Permissions.FeesRead)]
    [ProducesResponseType(typeof(ApiResponse<ReceiptDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetReceipt(Guid receiptId)
    {
        var query = new GetReceiptByIdQuery(receiptId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Receipt retrieved successfully.");
    }
}
