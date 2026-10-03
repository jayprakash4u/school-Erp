using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Organization;
using SchoolERP.Domain.Entities.Identity;

namespace SchoolERP.Application.Organization.Commands.UpdateCampus;

public record UpdateCampusCommand(
    Guid Id,
    string Name,
    string? Address = null,
    string? City = null,
    string? State = null,
    string? Country = null,
    string? PostalCode = null,
    string? Phone = null,
    string? Email = null,
    bool IsMainCampus = false) : IRequest<Result<CampusDto>>;

public class UpdateCampusCommandValidator : AbstractValidator<UpdateCampusCommand>
{
    public UpdateCampusCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
    }
}

public class UpdateCampusCommandHandler : IRequestHandler<UpdateCampusCommand, Result<CampusDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateCampusCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<CampusDto>> Handle(UpdateCampusCommand request, CancellationToken cancellationToken)
    {
        var campus = await _context.Campuses
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (campus == null)
        {
            return Result.Failure<CampusDto>(Error.NotFound("Campus.NotFound", $"Campus with ID {request.Id} was not found."));
        }

        if (request.IsMainCampus && !campus.IsMainCampus)
        {
            var otherMainCampuses = await _context.Campuses
                .Where(c => c.OrganizationId == campus.OrganizationId && c.IsMainCampus && c.Id != campus.Id)
                .ToListAsync(cancellationToken);

            foreach (var other in otherMainCampuses)
            {
                other.IsMainCampus = false;
            }
        }

        campus.Name = request.Name.Trim();
        campus.Address = request.Address;
        campus.City = request.City;
        campus.State = request.State;
        campus.Country = request.Country;
        campus.PostalCode = request.PostalCode;
        campus.Phone = request.Phone;
        campus.Email = request.Email;
        campus.IsMainCampus = request.IsMainCampus;

        _context.SecurityEvents.Add(new SecurityEvent(
            "CampusUpdated", 
            null, 
            $"Campus '{campus.Name}' ({campus.Code}) updated by {_currentUserService.UserId ?? "System"}"));

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
