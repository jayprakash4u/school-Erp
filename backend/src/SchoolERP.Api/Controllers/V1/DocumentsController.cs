using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Documents;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Documents;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/documents")]
[Authorize]
public class DocumentsController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.DocumentsRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<DocumentDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDocuments(
        [FromQuery] Guid? organizationId,
        [FromQuery] DocumentOwnerType? ownerType,
        [FromQuery] Guid? ownerEntityId,
        [FromQuery] Guid? documentTypeId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetDocumentsQuery(orgId.Value, ownerType, ownerEntityId, documentTypeId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Documents retrieved successfully.");
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.DocumentsRead)]
    [ProducesResponseType(typeof(ApiResponse<DocumentDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDocumentById(Guid id)
    {
        var query = new GetDocumentByIdQuery(id);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Document details retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.DocumentsUpload)]
    [ProducesResponseType(typeof(ApiResponse<DocumentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadMetadata(
        [FromBody] UploadDocumentMetadataRequest request,
        [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        if (!CurrentUserGuid.HasValue)
        {
            return Unauthorized("User ID not found in session context.");
        }

        var command = new UploadDocumentMetadataCommand(
            orgId.Value,
            CurrentUserGuid.Value,
            request.DocumentTypeId,
            request.Title,
            request.FileName,
            request.StoragePath,
            request.ContentType,
            request.FileSizeBytes,
            request.FileHashSha256,
            request.StorageProvider,
            request.SecurityLevel,
            request.OwnerType,
            request.OwnerEntityId,
            request.ExpiryDate,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Document metadata stored successfully.");
    }

    [HttpPost("{id:guid}/verify")]
    [HasPermission(Permissions.DocumentsVerify)]
    [ProducesResponseType(typeof(ApiResponse<DocumentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> VerifyDocument(
        Guid id,
        [FromBody] VerifyDocumentRequest request)
    {
        if (!CurrentUserGuid.HasValue)
        {
            return Unauthorized("User ID not found in session context.");
        }

        var command = new VerifyDocumentCommand(
            id,
            CurrentUserGuid.Value,
            request.IsVerified,
            request.VerificationNotes);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Document verification status updated successfully.");
    }

    [HttpPost("{id:guid}/access")]
    [HasPermission(Permissions.DocumentsManage)]
    [ProducesResponseType(typeof(ApiResponse<DocumentAccessDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GrantAccess(
        Guid id,
        [FromBody] GrantDocumentAccessRequest request)
    {
        var command = new GrantDocumentAccessCommand(
            id,
            request.Permission,
            request.GrantedToUserId,
            request.GrantedToRoleId,
            request.ExpiresAtUtc);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Document access granted successfully.");
    }
}
