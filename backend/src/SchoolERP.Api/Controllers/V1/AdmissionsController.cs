using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Students.Admissions;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/[controller]")]
[Authorize]
public class AdmissionsController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.AdmissionsRead)]
    [ProducesResponseType(typeof(PagedResponse<AdmissionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAdmissions(
        [FromQuery] Guid? organizationId,
        [FromQuery] Guid? campusId,
        [FromQuery] Guid? academicYearId,
        [FromQuery] Guid? programId,
        [FromQuery] AdmissionStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var effectiveCampusId = campusId ?? CurrentCampusId;

        var query = new GetAdmissionsQuery(
            orgId.Value,
            effectiveCampusId,
            academicYearId,
            programId,
            status,
            page,
            pageSize);

        var result = await Mediator.Send(query);
        return HandleResult(result, "Admissions retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.AdmissionsManage)]
    [ProducesResponseType(typeof(ApiResponse<AdmissionDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateAdmission(
        [FromBody] CreateAdmissionRequest request,
        [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var effectiveCampusId = request.CampusId ?? CurrentCampusId;

        var command = new CreateAdmissionCommand(
            orgId.Value,
            request.AcademicYearId,
            request.ProgramId,
            request.CandidateFirstName,
            request.CandidateLastName,
            request.CandidateGender,
            request.CandidateDateOfBirth,
            request.StreamId,
            request.CandidateEmail,
            request.CandidatePhone,
            request.GuardianName,
            request.GuardianPhone,
            request.GuardianEmail,
            request.GuardianRelationship,
            request.Remarks,
            effectiveCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Admission application created successfully.");
    }

    [HttpPut("{id:guid}/process")]
    [HasPermission(Permissions.AdmissionsManage)]
    [ProducesResponseType(typeof(ApiResponse<AdmissionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ProcessAdmission(
        [FromRoute] Guid id,
        [FromBody] ProcessAdmissionRequest request)
    {
        var result = await Mediator.Send(new ProcessAdmissionCommand(id, request));
        return HandleResult(result, "Admission processed successfully.");
    }
}
