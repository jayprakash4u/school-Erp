using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Hostel;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Hostel;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/hostel-allocations")]
[Authorize]
public class HostelAllocationsController : ApiControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.HostelAllocate)]
    [ProducesResponseType(typeof(ApiResponse<HostelAllocationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AllocateStudent(
        [FromBody] AllocateStudentHostelRequest request,
        [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new AllocateStudentHostelCommand(
            orgId.Value,
            request.StudentId,
            request.AcademicYearId,
            request.BedId,
            request.AllocationDate,
            request.Remarks,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Student allocated to hostel bed successfully.");
    }

    [HttpPost("{id:guid}/vacate")]
    [HasPermission(Permissions.HostelAllocate)]
    [ProducesResponseType(typeof(ApiResponse<HostelAllocationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> VacateAllocation(
        Guid id,
        [FromBody] VacateHostelRequest? request)
    {
        var command = new VacateHostelCommand(id, request?.Reason, request?.VacatedDate);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Hostel allocation vacated successfully.");
    }

    [HttpGet("student/{studentId:guid}")]
    [HasPermission(Permissions.HostelRead)]
    [ProducesResponseType(typeof(ApiResponse<HostelAllocationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStudentAllocation(
        Guid studentId,
        [FromQuery] Guid? academicYearId)
    {
        var query = new GetStudentHostelAllocationQuery(studentId, academicYearId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Student hostel allocation retrieved successfully.");
    }

    [HttpPost("generate-fees")]
    [HasPermission(Permissions.HostelManage)]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GenerateMonthlyFees(
        [FromBody] GenerateMonthlyHostelFeeRequest request,
        [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new GenerateMonthlyHostelFeeCommand(
            orgId.Value,
            request.AcademicYearId,
            request.Month,
            request.Year,
            request.DueDate,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Monthly hostel fees generated successfully.");
    }
}
