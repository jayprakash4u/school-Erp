using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Organization;
using SchoolERP.Domain.Entities.Identity;
using SchoolERP.Domain.Entities.Organization;

namespace SchoolERP.Application.Organization.Commands.CreateOrganization;

public record CreateOrganizationCommand(
    string Code,
    string Name,
    OrganizationType Type = OrganizationType.School,
    string? Description = null,
    string? Email = null,
    string? Phone = null,
    string? Address = null,
    string? City = null,
    string? State = null,
    string? Country = null,
    string? PostalCode = null,
    string? Website = null,
    string? LogoUrl = null,
    string? Currency = "USD",
    string? TimeZone = "UTC",
    Guid? ParentOrganizationId = null,
    string? InitialCampusName = null) : IRequest<Result<OrganizationDetailDto>>;

public class CreateOrganizationCommandValidator : AbstractValidator<CreateOrganizationCommand>
{
    public CreateOrganizationCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Organization code is required.")
            .MaximumLength(50);

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Organization name is required.")
            .MaximumLength(200);

        RuleFor(x => x.Email)
            .EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email))
            .WithMessage("A valid email address is required.");
    }
}

public class CreateOrganizationCommandHandler : IRequestHandler<CreateOrganizationCommand, Result<OrganizationDetailDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreateOrganizationCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<OrganizationDetailDto>> Handle(CreateOrganizationCommand request, CancellationToken cancellationToken)
    {
        var normalizedCode = request.Code.Trim().ToUpperInvariant();
        var exists = await _context.Organizations
            .AnyAsync(o => o.NormalizedCode == normalizedCode, cancellationToken);

        if (exists)
        {
            return Result.Failure<OrganizationDetailDto>(Error.Conflict(
                "Organization.DuplicateCode", 
                $"An organization with code '{request.Code}' already exists."));
        }

        var organization = new Domain.Entities.Organization.Organization(request.Code.Trim(), request.Name.Trim(), request.Type, request.ParentOrganizationId)
        {
            Description = request.Description,
            Email = request.Email,
            Phone = request.Phone,
            Address = request.Address,
            City = request.City,
            State = request.State,
            Country = request.Country,
            PostalCode = request.PostalCode,
            Website = request.Website,
            LogoUrl = request.LogoUrl,
            Currency = request.Currency ?? "USD",
            TimeZone = request.TimeZone ?? "UTC",
            IsActive = true
        };

        // Create default / initial campus if requested or by default
        var initialCampusName = string.IsNullOrWhiteSpace(request.InitialCampusName)
            ? $"{request.Name.Trim()} Main Campus"
            : request.InitialCampusName.Trim();

        var mainCampus = new Campus(organization.Id, $"{organization.Code}-MAIN", initialCampusName, isMainCampus: true)
        {
            Address = request.Address,
            City = request.City,
            State = request.State,
            Country = request.Country,
            PostalCode = request.PostalCode,
            Phone = request.Phone,
            Email = request.Email,
            IsActive = true
        };

        organization.Campuses.Add(mainCampus);

        // If user is authenticated, link creator as primary org user
        if (Guid.TryParse(_currentUserService.UserId, out var creatorUserId))
        {
            organization.OrganizationUsers.Add(new OrganizationUser
            {
                OrganizationId = organization.Id,
                UserId = creatorUserId,
                CampusId = mainCampus.Id,
                IsPrimary = true,
                AssignedBy = _currentUserService.UserId
            });
        }

        _context.Organizations.Add(organization);

        _context.SecurityEvents.Add(new SecurityEvent(
            "OrganizationCreated", 
            creatorUserId != Guid.Empty ? creatorUserId : null, 
            $"Organization '{organization.Name}' (Code: {organization.Code}) was created by {_currentUserService.UserId ?? "System"}"));

        await _context.SaveChangesAsync(cancellationToken);

        var campusDtos = organization.Campuses.Select(c => new CampusDto(
            c.Id,
            c.OrganizationId,
            c.Code,
            c.Name,
            c.Address,
            c.City,
            c.State,
            c.Country,
            c.PostalCode,
            c.Phone,
            c.Email,
            c.IsMainCampus,
            c.IsActive,
            c.CreatedAtUtc)).ToList();

        var detailDto = new OrganizationDetailDto(
            organization.Id,
            organization.Code,
            organization.Name,
            organization.Type,
            organization.Description,
            organization.Email,
            organization.Phone,
            organization.Address,
            organization.City,
            organization.State,
            organization.Country,
            organization.PostalCode,
            organization.Website,
            organization.LogoUrl,
            organization.Currency,
            organization.TimeZone,
            organization.IsActive,
            organization.ParentOrganizationId,
            null,
            campusDtos,
            organization.CreatedAtUtc);

        return Result.Success(detailDto);
    }
}
