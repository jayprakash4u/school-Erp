using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Students.Enrollments;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/[controller]")]
[Authorize]
public class EnrollmentsController : ApiControllerBase
{
    [HttpGet("student/{studentId:guid}")]
    [HasPermission(Permissions.StudentsRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<EnrollmentDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStudentEnrollments([FromRoute] Guid studentId)
    {
        var result = await Mediator.Send(new GetStudentEnrollmentsQuery(studentId));
        return HandleResult(result, "Enrollment history retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.StudentsUpdate)]
    [ProducesResponseType(typeof(ApiResponse<EnrollmentDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateEnrollment([FromBody] CreateEnrollmentRequest request)
    {
        var command = new CreateEnrollmentCommand(
            request.StudentId,
            request.AcademicYearId,
            request.ProgramId,
            request.SectionId,
            request.StreamId,
            request.BatchId,
            request.AcademicPeriodId,
            request.RollNumber,
            request.EnrollmentDate,
            request.Remarks);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Student enrolled successfully.");
    }

    [HttpPost("student/{studentId:guid}/promote")]
    [HasPermission(Permissions.StudentsUpdate)]
    [ProducesResponseType(typeof(ApiResponse<EnrollmentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> PromoteStudent(
        [FromRoute] Guid studentId,
        [FromBody] PromoteStudentRequest request)
    {
        var command = new PromoteStudentCommand(studentId, request);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Student promoted successfully.");
    }
}
