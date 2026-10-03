using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Examinations;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Examinations;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/exams")]
[Authorize]
public class ExamsController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.ExamsRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ExamDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetExams(
        [FromQuery] Guid? organizationId,
        [FromQuery] Guid? academicYearId,
        [FromQuery] Guid? campusId,
        [FromQuery] ExamStatus? status)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetExamsQuery(orgId.Value, academicYearId, campusId ?? CurrentCampusId, status);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Exams retrieved successfully.");
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.ExamsRead)]
    [ProducesResponseType(typeof(ApiResponse<ExamDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetExamById(Guid id)
    {
        var query = new GetExamByIdQuery(id);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Exam details retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.ExamsCreate)]
    [ProducesResponseType(typeof(ApiResponse<ExamDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateExam([FromBody] CreateExamRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CreateExamCommand(
            orgId.Value,
            request.AcademicYearId,
            request.ExamTypeId,
            request.Code,
            request.Name,
            request.StartDate,
            request.EndDate,
            request.AcademicPeriodId,
            request.GradingScaleId,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Exam created successfully.");
    }

    [HttpPost("{id:guid}/schedule")]
    [HasPermission(Permissions.ExamsCreate)]
    [ProducesResponseType(typeof(ApiResponse<ExamSubjectDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ScheduleSubject(Guid id, [FromBody] ScheduleExamSubjectRequest request)
    {
        var command = new ScheduleExamSubjectCommand(
            id,
            request.SubjectId,
            request.ProgramId,
            request.ExamDate,
            request.StartTime,
            request.EndTime,
            request.MaxTheoryMarks,
            request.MaxPracticalMarks,
            request.PassingMarks);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Exam subject paper scheduled successfully.");
    }

    [HttpPost("{id:guid}/publish")]
    [HasPermission(Permissions.ExamsCreate)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> PublishExam(Guid id)
    {
        var command = new PublishExamCommand(id);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Exam published successfully.");
    }
}
