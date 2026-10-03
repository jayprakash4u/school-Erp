using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Organization;
using SchoolERP.Domain.Entities.Identity;
using SchoolERP.Domain.Entities.Organization;

namespace SchoolERP.Application.Organization.Commands.CreateCampus;

public record CreateCampusCommand(
    Guid OrganizationId,
    string Code,
    string Name,
    string? Address = null,
    string? City = null,
    string? State = null,
    string? Country = null,
    string? PostalCode = null,
    string? Phone = null,
    string? Email = null,
    bool IsMainCampus = false) : IRequest<Result<CampusDto>>;

public class CreateCampusCommandValidator : AbstractValidator<CreateCampusCommand>
{
    public CreateCampusCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
    }
}

public class CreateCampusCommandHandler : IRequestHandler<CreateCampusCommand, Result<CampusDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreateCampusCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<CampusDto>> Handle(CreateCampusCommand request, CancellationToken cancellationToken)
    {
        var org = await _context.Organizations
            .Include(o => o.Campuses)
            .FirstOrDefaultAsync(o => o.Id == request.OrganizationId, cancellationToken);

        if (org == null)
        {
            return Result.Failure<CampusDto>(Error.NotFound("Organization.NotFound", $"Organization with ID {request.OrganizationId} was not found."));
        }

        var normalizedCode = request.Code.Trim().ToUpperInvariant();
        var exists = org.Campuses.Any(c => c.NormalizedCode == normalizedCode);
        if (exists)
        {
            return Result.Failure<CampusDto>(Error.Conflict("Campus.DuplicateCode", $"A campus with code '{request.Code}' already exists in this organization."));
        }

        if (request.IsMainCampus)
        {
            foreach (var c in org.Campuses.Where(c => c.IsMainCampus))
            {
                c.IsMainCampus = false;
            }
        }

        var campus = new Campus(org.Id, request.Code.Trim(), request.Name.Trim(), request.IsMainCampus)
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

        _context.Campuses.Add(campus);

        _context.SecurityEvents.Add(new SecurityEvent(
            "CampusCreated", 
            null, 
            $"Campus '{campus.Name}' ({campus.Code}) created under org '{org.Name}' by {_currentUserService.UserId ?? "System"}"));

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new CampusDto(
            campus.Id,
            campus.OrganizationId,
            campus.Code,
            campus.Name,
            campus.Address,
            campus.City,
            campus.State,
            campus.Country,
            campus.PostalCode,
            campus.Phone,
            campus.Email,
            campus.IsMainCampus,
            campus.IsActive,
            campus.CreatedAtUtc);

        return Result.Success(dto);
    }
}
