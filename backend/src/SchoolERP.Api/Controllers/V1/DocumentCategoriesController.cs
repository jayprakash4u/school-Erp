using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Documents;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Documents;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/document-categories")]
[Authorize]
public class DocumentCategoriesController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.DocumentsRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<DocumentCategoryDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategories(
        [FromQuery] Guid? organizationId,
        [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetDocumentCategoriesQuery(orgId.Value, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Document categories retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.DocumentsManage)]
    [ProducesResponseType(typeof(ApiResponse<DocumentCategoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCategory(
        [FromBody] CreateDocumentCategoryRequest request,
        [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CreateDocumentCategoryCommand(
            orgId.Value,
            request.Code,
            request.Name,
            request.Description,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Document category created successfully.");
    }

    [HttpGet("{categoryId:guid}/types")]
    [HasPermission(Permissions.DocumentsRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<DocumentTypeDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTypes(
        Guid categoryId,
        [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetDocumentTypesQuery(orgId.Value, categoryId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Document types retrieved successfully.");
    }

    [HttpPost("{categoryId:guid}/types")]
    [HasPermission(Permissions.DocumentsManage)]
    [ProducesResponseType(typeof(ApiResponse<DocumentTypeDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateType(
        Guid categoryId,
        [FromBody] CreateDocumentTypeRequest request,
        [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CreateDocumentTypeCommand(
            orgId.Value,
            categoryId,
            request.Code,
            request.Name,
            request.AllowedOwnerType,
            request.IsRequiredForAdmission,
            request.IsRequiredForEmployment,
            request.MaxFileSizeBytes,
            request.AllowedExtensions,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Document type created successfully.");
    }
}
