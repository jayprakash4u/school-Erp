using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Fees;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Fees;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/invoices")]
[Authorize]
public class InvoicesController : ApiControllerBase
{
    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.FeesRead)]
    [ProducesResponseType(typeof(ApiResponse<InvoiceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetInvoiceById(Guid id)
    {
        var query = new GetInvoiceByIdQuery(id);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Invoice retrieved successfully.");
    }

    [HttpGet("student/{studentId:guid}")]
    [HasPermission(Permissions.FeesRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<InvoiceDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStudentInvoices(Guid studentId, [FromQuery] Guid? academicYearId)
    {
        var query = new GetStudentInvoicesQuery(studentId, academicYearId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Student invoices retrieved successfully.");
    }

    [HttpPost("generate")]
    [HasPermission(Permissions.FeesManage)]
    [ProducesResponseType(typeof(ApiResponse<InvoiceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GenerateInvoice([FromBody] GenerateInvoiceRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new GenerateInvoiceCommand(
            orgId.Value,
            request.StudentId,
            request.AcademicYearId,
            request.ProgramId,
            request.DueDate,
            request.SpecificFeeHeadIds,
            request.Remarks,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Invoice generated and posted to ledger successfully.");
    }

    [HttpPost("batch-generate")]
    [HasPermission(Permissions.FeesManage)]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> BatchGenerateInvoices([FromBody] BatchGenerateInvoicesRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new BatchGenerateInvoicesCommand(
            orgId.Value,
            request.AcademicYearId,
            request.ProgramId,
            request.DueDate,
            request.SectionId,
            request.Remarks,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Invoices batch generated successfully.");
    }
}
