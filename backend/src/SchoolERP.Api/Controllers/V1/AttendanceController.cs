using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Attendance;
using SchoolERP.Contracts.Attendance;
using SchoolERP.Contracts.Common;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/[controller]")]
[Authorize]
public class AttendanceController : ApiControllerBase
{
    [HttpPost("take")]
    [HasPermission(Permissions.AttendanceCreate)]
    [ProducesResponseType(typeof(ApiResponse<AttendanceSessionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> TakeAttendance(
        [FromBody] TakeAttendanceRequest request,
        [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new TakeAttendanceCommand(
            orgId.Value,
            request.AcademicYearId,
            request.ProgramId,
            request.SectionId,
            request.Date,
            request.Entries,
            request.SubjectId,
            request.Type,
            request.TakenByStaffId,
            request.Remarks,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Attendance recorded successfully.");
    }

    [HttpGet("roster")]
    [HasPermission(Permissions.AttendanceRead)]
    [ProducesResponseType(typeof(ApiResponse<SectionAttendanceRosterDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSectionRoster(
        [FromQuery] Guid sectionId,
        [FromQuery] DateOnly date,
        [FromQuery] Guid? subjectId = null,
        [FromQuery] AttendanceType type = AttendanceType.Daily)
    {
        var query = new GetSectionAttendanceRosterQuery(sectionId, date, subjectId, type);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Section roster retrieved successfully.");
    }

    [HttpGet("student/{studentId:guid}")]
    [HasPermission(Permissions.AttendanceRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<StudentDailyAttendanceDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStudentAttendance(
        [FromRoute] Guid studentId,
        [FromQuery] DateOnly? startDate,
        [FromQuery] DateOnly? endDate,
        [FromQuery] Guid? academicYearId)
    {
        var query = new GetStudentAttendanceQuery(studentId, startDate, endDate, academicYearId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Student attendance retrieved successfully.");
    }

    [HttpGet("student/{studentId:guid}/summary")]
    [HasPermission(Permissions.AttendanceRead)]
    [ProducesResponseType(typeof(ApiResponse<AttendanceSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStudentAttendanceSummary(
        [FromRoute] Guid studentId,
        [FromQuery] Guid? academicYearId)
    {
        var query = new GetStudentAttendanceSummaryQuery(studentId, academicYearId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Student attendance summary retrieved successfully.");
    }

    [HttpPost("correction")]
    [HasPermission(Permissions.AttendanceUpdate)]
    [ProducesResponseType(typeof(ApiResponse<AttendanceCorrectionDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RequestCorrection([FromBody] CreateAttendanceCorrectionRequest request)
    {
        var command = new RequestAttendanceCorrectionCommand(
            request.AttendanceRecordId,
            request.NewStatus,
            request.Reason,
            CurrentUserId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Attendance correction requested successfully.");
    }

    [HttpPut("correction/{id:guid}/process")]
    [HasPermission(Permissions.AttendanceUpdate)]
    [ProducesResponseType(typeof(ApiResponse<AttendanceCorrectionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ProcessCorrection(
        [FromRoute] Guid id,
        [FromBody] ProcessAttendanceCorrectionRequest request)
    {
        var command = new ProcessAttendanceCorrectionCommand(id, request.Status, request.ReviewRemarks, CurrentUserId);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Attendance correction processed successfully.");
    }
}
