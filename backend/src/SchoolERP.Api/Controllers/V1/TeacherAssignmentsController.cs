using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Staff.TeacherAssignments;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Staff;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/[controller]")]
[Authorize]
public class TeacherAssignmentsController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.TeachersRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<TeacherAssignmentDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTeacherAssignments(
        [FromQuery] Guid? staffId,
        [FromQuery] Guid? sectionId,
        [FromQuery] Guid? programId,
        [FromQuery] Guid? academicYearId)
    {
        var result = await Mediator.Send(new GetTeacherAssignmentsQuery(staffId, sectionId, programId, academicYearId));
        return HandleResult(result, "Teacher assignments retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.TeachersUpdate)]
    [ProducesResponseType(typeof(ApiResponse<TeacherAssignmentDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateTeacherAssignment([FromBody] CreateTeacherAssignmentRequest request)
    {
        var command = new CreateTeacherAssignmentCommand(
            request.StaffId,
            request.SubjectId,
            request.ProgramId,
            request.AcademicYearId,
            request.SectionId,
            request.AcademicPeriodId,
            request.IsPrimaryTeacher,
            request.AssignedDate,
            request.Remarks);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Teacher assigned successfully.");
    }

    [HttpDelete("{id:guid}")]
    [HasPermission(Permissions.TeachersUpdate)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeactivateTeacherAssignment([FromRoute] Guid id)
    {
        var result = await Mediator.Send(new DeactivateTeacherAssignmentCommand(id));
        return HandleResult(result, "Teacher assignment deactivated successfully.");
    }
}
