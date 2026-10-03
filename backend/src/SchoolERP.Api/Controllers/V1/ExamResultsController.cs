using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Examinations;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Examinations;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/exam-results")]
[Authorize]
public class ExamResultsController : ApiControllerBase
{
    [HttpPost("calculate")]
    [HasPermission(Permissions.ExamsCreate)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ExamResultDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CalculateResults([FromBody] CalculateExamResultsRequest request)
    {
        var command = new CalculateExamResultsCommand(
            request.ExamId,
            request.ProgramId,
            request.SectionId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Exam results calculated successfully.");
    }

    [HttpGet("student/{studentId:guid}")]
    [HasPermission(Permissions.ExamsRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ExamResultDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStudentResults(Guid studentId, [FromQuery] Guid? examId)
    {
        var query = new GetStudentExamResultsQuery(studentId, examId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Student exam results retrieved successfully.");
    }
}
