using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Fees;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Fees;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/refunds")]
[Authorize]
public class RefundsController : ApiControllerBase
{
    [HttpPost("process")]
    [HasPermission(Permissions.FeesManage)]
    [ProducesResponseType(typeof(ApiResponse<RefundDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ProcessRefund([FromBody] ProcessRefundRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new ProcessRefundCommand(
            orgId.Value,
            request.StudentId,
            request.Amount,
            request.Reason,
            request.PaymentId,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Refund processed and posted to ledger successfully.");
    }
}

[Route("api/v1/adjustments")]
[Authorize]
public class AdjustmentsController : ApiControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.FeesManage)]
    [ProducesResponseType(typeof(ApiResponse<AdjustmentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateAdjustment([FromBody] CreateAdjustmentRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CreateAdjustmentCommand(
            orgId.Value,
            request.StudentId,
            request.Type,
            request.Amount,
            request.Reason,
            request.InvoiceId,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Adjustment created and posted to ledger successfully.");
    }
}

[Route("api/v1/ledger")]
[Authorize]
public class LedgerController : ApiControllerBase
{
    [HttpGet("student/{studentId:guid}")]
    [HasPermission(Permissions.FeesRead)]
    [ProducesResponseType(typeof(ApiResponse<StudentLedgerSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStudentLedger(Guid studentId, [FromQuery] Guid? academicYearId)
    {
        var query = new GetStudentLedgerQuery(studentId, academicYearId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Student ledger summary retrieved successfully.");
    }
}
