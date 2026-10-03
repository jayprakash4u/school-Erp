using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Organization;
using SchoolERP.Domain.Entities.Identity;
using SchoolERP.Domain.Entities.Organization;

namespace SchoolERP.Application.Organization.Commands.UpdateOrganization;

public record UpdateOrganizationCommand(
    Guid Id,
    string Name,
    OrganizationType Type,
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
    string? TimeZone = "UTC") : IRequest<Result<OrganizationDto>>;

public class UpdateOrganizationCommandValidator : AbstractValidator<UpdateOrganizationCommand>
{
    public UpdateOrganizationCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
    }
}

public class UpdateOrganizationCommandHandler : IRequestHandler<UpdateOrganizationCommand, Result<OrganizationDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateOrganizationCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<OrganizationDto>> Handle(UpdateOrganizationCommand request, CancellationToken cancellationToken)
    {
        var org = await _context.Organizations
            .Include(o => o.Campuses)
            .FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken);

        if (org == null)
        {
            return Result.Failure<OrganizationDto>(Error.NotFound("Organization.NotFound", $"Organization with ID {request.Id} was not found."));
        }

        org.Name = request.Name.Trim();
        org.Type = request.Type;
        org.Description = request.Description;
        org.Email = request.Email;
        org.Phone = request.Phone;
        org.Address = request.Address;
        org.City = request.City;
        org.State = request.State;
        org.Country = request.Country;
        org.PostalCode = request.PostalCode;
        org.Website = request.Website;
        if (request.LogoUrl != null)
        {
            org.LogoUrl = request.LogoUrl;
        }
        org.Currency = request.Currency ?? org.Currency;
        org.TimeZone = request.TimeZone ?? org.TimeZone;

        _context.SecurityEvents.Add(new SecurityEvent(
            "OrganizationUpdated", 
            null, 
            $"Organization '{org.Name}' ({org.Code}) updated by {_currentUserService.UserId ?? "System"}"));

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new OrganizationDto(
            org.Id,
            org.Code,
            org.Name,
            org.Type,
            org.Description,
            org.Email,
            org.Phone,
            org.Address,
            org.City,
            org.State,
            org.Country,
            org.Website,
            org.LogoUrl,
            org.Currency,
            org.TimeZone,
            org.IsActive,
            org.ParentOrganizationId,
            org.Campuses.Count,
            org.CreatedAtUtc);

        return Result.Success(dto);
    }
}
