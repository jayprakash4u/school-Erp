using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Reports;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Reports;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/reports")]
[Authorize]
public class ReportsController : ApiControllerBase
{
    // =========================================================================
    // 1. STUDENT REPORT
    // =========================================================================

    [HttpGet("students")]
    [HasPermission(Permissions.ReportsRead)]
    [ProducesResponseType(typeof(ApiResponse<StudentReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStudentReport([FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetStudentReportQuery(orgId.Value, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Student report retrieved successfully.");
    }

    // =========================================================================
    // 2. STAFF REPORT
    // =========================================================================

    [HttpGet("staff")]
    [HasPermission(Permissions.ReportsRead)]
    [ProducesResponseType(typeof(ApiResponse<StaffReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStaffReport([FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetStaffReportQuery(orgId.Value, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Staff report retrieved successfully.");
    }

    // =========================================================================
    // 3. ATTENDANCE REPORT
    // =========================================================================

    [HttpGet("attendance")]
    [HasPermission(Permissions.ReportsRead)]
    [ProducesResponseType(typeof(ApiResponse<AttendanceReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAttendanceReport(
        [FromQuery] DateOnly fromDate,
        [FromQuery] DateOnly toDate,
        [FromQuery] Guid? gradeId,
        [FromQuery] Guid? organizationId,
        [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetAttendanceReportQuery(orgId.Value, fromDate, toDate, gradeId, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Attendance report retrieved successfully.");
    }

    // =========================================================================
    // 4. EXAM RESULT REPORT
    // =========================================================================

    [HttpGet("exams/{examId:guid}")]
    [HasPermission(Permissions.ReportsAcademicRead)]
    [ProducesResponseType(typeof(ApiResponse<ExamResultReportDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetExamResultReport(
        Guid examId,
        [FromQuery] Guid? gradeId,
        [FromQuery] Guid? organizationId,
        [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetExamResultReportQuery(orgId.Value, examId, gradeId, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Exam result report retrieved successfully.");
    }

    // =========================================================================
    // 5. FINANCIAL: FEE COLLECTION REPORT
    // =========================================================================

    [HttpGet("fees/collections")]
    [HasPermission(Permissions.ReportsFinancialRead)]
    [ProducesResponseType(typeof(ApiResponse<FeeCollectionReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFeeCollectionReport(
        [FromQuery] DateOnly fromDate,
        [FromQuery] DateOnly toDate,
        [FromQuery] Guid? organizationId,
        [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetFeeCollectionReportQuery(orgId.Value, fromDate, toDate, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Fee collection report retrieved successfully.");
    }

    // =========================================================================
    // 6. FINANCIAL: OUTSTANDING FEE REPORT
    // =========================================================================

    [HttpGet("fees/outstanding")]
    [HasPermission(Permissions.ReportsFinancialRead)]
    [ProducesResponseType(typeof(ApiResponse<OutstandingFeeReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOutstandingFeeReport(
        [FromQuery] Guid? academicYearId,
        [FromQuery] Guid? gradeId,
        [FromQuery] Guid? organizationId,
        [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetOutstandingFeeReportQuery(orgId.Value, academicYearId, gradeId, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Outstanding fee report retrieved successfully.");
    }

    // =========================================================================
    // 7. LIBRARY REPORT
    // =========================================================================

    [HttpGet("library")]
    [HasPermission(Permissions.ReportsRead)]
    [ProducesResponseType(typeof(ApiResponse<LibraryReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLibraryReport([FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetLibraryReportQuery(orgId.Value, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Library report retrieved successfully.");
    }

    // =========================================================================
    // 8. TRANSPORT REPORT
    // =========================================================================

    [HttpGet("transport")]
    [HasPermission(Permissions.ReportsRead)]
    [ProducesResponseType(typeof(ApiResponse<TransportReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTransportReport([FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetTransportReportQuery(orgId.Value, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Transport report retrieved successfully.");
    }

    // =========================================================================
    // 9. HOSTEL REPORT
    // =========================================================================

    [HttpGet("hostel")]
    [HasPermission(Permissions.ReportsRead)]
    [ProducesResponseType(typeof(ApiResponse<HostelReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetHostelReport([FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetHostelReportQuery(orgId.Value, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Hostel report retrieved successfully.");
    }
}
