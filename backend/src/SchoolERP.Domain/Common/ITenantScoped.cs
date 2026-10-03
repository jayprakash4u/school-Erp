namespace SchoolERP.Domain.Common;

public interface ITenantScoped
{
    Guid OrganizationId { get; set; }
    Guid? CampusId { get; set; }
}
