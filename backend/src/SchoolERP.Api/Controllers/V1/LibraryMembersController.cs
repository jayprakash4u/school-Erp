using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Library;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Library;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/library/members")]
[Authorize]
public class LibraryMembersController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.LibraryRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<LibraryMemberDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMembers(
        [FromQuery] Guid? organizationId,
        [FromQuery] MemberType? memberType,
        [FromQuery] MembershipStatus? status,
        [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetLibraryMembersQuery(orgId.Value, memberType, status, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Library members retrieved successfully.");
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.LibraryRead)]
    [ProducesResponseType(typeof(ApiResponse<LibraryMemberDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMemberById(Guid id)
    {
        var query = new GetLibraryMemberByIdQuery(id);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Library member profile retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.LibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<LibraryMemberDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegisterMember([FromBody] RegisterLibraryMemberRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new RegisterLibraryMemberCommand(
            orgId.Value,
            request.MemberType,
            request.StudentId,
            request.StaffId,
            request.IssueLimit,
            request.MaxIssueDays,
            request.FinePerDay,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Library member registered successfully.");
    }
}

[Route("api/v1/library/circulation")]
[Authorize]
public class CirculationController : ApiControllerBase
{
    [HttpPost("issue")]
    [HasPermission(Permissions.LibraryIssue)]
    [ProducesResponseType(typeof(ApiResponse<BookIssueDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> IssueBook([FromBody] IssueBookRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new IssueBookCommand(
            orgId.Value,
            request.LibraryMemberId,
            request.AccessionNumber,
            request.IssueDate,
            request.IssuedByStaffId,
            request.Remarks,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Book issued successfully.");
    }

    [HttpPost("return")]
    [HasPermission(Permissions.LibraryReturn)]
    [ProducesResponseType(typeof(ApiResponse<BookReturnDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ReturnBook([FromBody] ReturnBookRequest request)
    {
        var command = new ReturnBookCommand(
            request.BookIssueId,
            request.ReceivedCondition,
            request.ReturnDate,
            request.ReceivedByStaffId,
            request.Remarks);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Book return processed successfully.");
    }

    [HttpPost("fines/{id:guid}/pay")]
    [HasPermission(Permissions.LibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<LibraryFineDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> PayFine(Guid id, [FromBody] PayLibraryFineRequest request)
    {
        var command = new PayLibraryFineCommand(id, request.Amount, request.PaymentReference);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Library fine payment recorded successfully.");
    }

    [HttpPost("fines/{id:guid}/waive")]
    [HasPermission(Permissions.LibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<LibraryFineDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> WaiveFine(Guid id, [FromBody] WaiveLibraryFineRequest request)
    {
        var command = new WaiveLibraryFineCommand(id, request.Reason);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Library fine waived successfully.");
    }

    [HttpGet("member/{memberId:guid}")]
    [HasPermission(Permissions.LibraryRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<BookIssueDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMemberCirculationHistory(Guid memberId)
    {
        var query = new GetMemberCirculationHistoryQuery(memberId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Member circulation history retrieved successfully.");
    }
}
