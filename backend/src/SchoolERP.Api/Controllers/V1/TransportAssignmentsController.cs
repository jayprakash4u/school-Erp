using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Transport;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Transport;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/transport/assignments")]
[Authorize]
public class TransportAssignmentsController : ApiControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.TransportAssign)]
    [ProducesResponseType(typeof(ApiResponse<TransportAssignmentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AssignStudent(
        [FromBody] AssignStudentTransportRequest request,
        [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new AssignStudentTransportCommand(
            orgId.Value,
            request.StudentId,
            request.AcademicYearId,
            request.RouteId,
            request.RouteStopId,
            request.ServiceType,
            request.StartDate,
            request.Remarks,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Student transport assigned successfully.");
    }

    [HttpPost("{id:guid}/cancel")]
    [HasPermission(Permissions.TransportAssign)]
    [ProducesResponseType(typeof(ApiResponse<TransportAssignmentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CancelAssignment(
        Guid id,
        [FromBody] CancelAssignmentRequest? request)
    {
        var command = new CancelTransportAssignmentCommand(id, request?.Reason);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Transport assignment cancelled successfully.");
    }

    [HttpGet("student/{studentId:guid}")]
    [HasPermission(Permissions.TransportRead)]
    [ProducesResponseType(typeof(ApiResponse<TransportAssignmentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStudentAssignment(
        Guid studentId,
        [FromQuery] Guid? academicYearId)
    {
        var query = new GetStudentTransportAssignmentQuery(studentId, academicYearId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Student transport assignment retrieved successfully.");
    }

    [HttpPost("generate-fees")]
    [HasPermission(Permissions.TransportManage)]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GenerateMonthlyFees(
        [FromBody] GenerateMonthlyTransportFeeRequest request,
        [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new GenerateMonthlyTransportFeeCommand(
            orgId.Value,
            request.AcademicYearId,
            request.Month,
            request.Year,
            request.DueDate,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Monthly transport fees generated successfully.");
    }
}
