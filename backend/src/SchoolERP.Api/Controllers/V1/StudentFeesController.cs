using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Fees;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Fees;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/student-fees")]
[Authorize]
public class StudentFeesController : ApiControllerBase
{
    [HttpGet("student/{studentId:guid}")]
    [HasPermission(Permissions.FeesRead)]
    [ProducesResponseType(typeof(ApiResponse<StudentFeeDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStudentFee(Guid studentId, [FromQuery] Guid? academicYearId)
    {
        var query = new GetStudentFeeQuery(studentId, academicYearId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Student fee plan retrieved successfully.");
    }

    [HttpPost("assign")]
    [HasPermission(Permissions.FeesManage)]
    [ProducesResponseType(typeof(ApiResponse<StudentFeeDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AssignStudentFee([FromBody] AssignStudentFeeRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new AssignStudentFeeCommand(
            orgId.Value,
            request.StudentId,
            request.AcademicYearId,
            request.ProgramId,
            request.FeeStructureId,
            request.DiscountPolicyId,
            request.CustomDiscountAmount,
            request.Remarks,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Student fee assigned successfully.");
    }

    [HttpPost("batch-assign")]
    [HasPermission(Permissions.FeesManage)]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> BatchAssignStudentFees([FromBody] BatchAssignStudentFeesRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new BatchAssignStudentFeesCommand(
            orgId.Value,
            request.AcademicYearId,
            request.ProgramId,
            request.FeeStructureId,
            request.SectionId,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Student fees batch assigned successfully.");
    }
}
