using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Students;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/[controller]")]
[Authorize]
public class StudentsController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.StudentsRead)]
    [ProducesResponseType(typeof(PagedResponse<StudentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStudents(
        [FromQuery] Guid? organizationId,
        [FromQuery] Guid? campusId,
        [FromQuery] Guid? academicYearId,
        [FromQuery] Guid? programId,
        [FromQuery] Guid? sectionId,
        [FromQuery] StudentStatus? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var effectiveCampusId = campusId ?? CurrentCampusId;

        var query = new GetStudentsQuery(
            orgId.Value,
            effectiveCampusId,
            academicYearId,
            programId,
            sectionId,
            status,
            search,
            page,
            pageSize);

        var result = await Mediator.Send(query);
        return HandleResult(result, "Students retrieved successfully.");
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.StudentsRead)]
    [ProducesResponseType(typeof(ApiResponse<StudentDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStudentById([FromRoute] Guid id)
    {
        var result = await Mediator.Send(new GetStudentByIdQuery(id));
        return HandleResult(result, "Student details retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.StudentsCreate)]
    [ProducesResponseType(typeof(ApiResponse<StudentDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateStudent(
        [FromBody] CreateStudentRequest request,
        [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var effectiveCampusId = request.CampusId ?? CurrentCampusId;

        var command = new CreateStudentCommand(
            orgId.Value,
            request.AdmissionNumber,
            request.FirstName,
            request.MiddleName,
            request.LastName,
            request.Gender,
            request.DateOfBirth,
            request.Email,
            request.PhoneNumber,
            request.EmergencyContactNumber,
            request.BloodGroup,
            request.Nationality,
            request.Religion,
            request.Category,
            request.AadharOrNationalId,
            request.AvatarUrl,
            effectiveCampusId,
            request.InitialAcademicYearId,
            request.InitialProgramId,
            request.InitialStreamId,
            request.InitialSectionId,
            request.InitialBatchId,
            request.InitialRollNumber,
            request.PrimaryGuardian,
            request.Address);

        var result = await Mediator.Send(command);
        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetStudentById), new { id = result.Value.Id }, ApiResponse<StudentDto>.Ok(result.Value, "Student created successfully."));
        }

        return HandleResult(result);
    }

    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.StudentsUpdate)]
    [ProducesResponseType(typeof(ApiResponse<StudentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStudent(
        [FromRoute] Guid id,
        [FromBody] UpdateStudentRequest request)
    {
        var result = await Mediator.Send(new UpdateStudentCommand(id, request));
        return HandleResult(result, "Student updated successfully.");
    }

    [HttpPut("{id:guid}/status")]
    [HasPermission(Permissions.StudentsUpdate)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStudentStatus(
        [FromRoute] Guid id,
        [FromBody] UpdateStudentStatusRequest request)
    {
        var result = await Mediator.Send(new ChangeStudentStatusCommand(id, request.Status, request.Reason));
        return HandleResult(result, "Student status updated successfully.");
    }
}
