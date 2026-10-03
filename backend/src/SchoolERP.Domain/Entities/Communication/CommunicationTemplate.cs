using SchoolERP.Contracts.Communication;
using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Communication;

public class CommunicationTemplate : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public TemplateType TemplateType { get; set; } = TemplateType.GeneralAnnouncement;
    public CommunicationChannel Channel { get; set; } = CommunicationChannel.InApp;

    public string SubjectTemplate { get; set; } = string.Empty;
    public string BodyTemplate { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public CommunicationTemplate()
    {
        Id = Guid.NewGuid();
    }

    public CommunicationTemplate(
        Guid organizationId,
        string code,
        string name,
        TemplateType templateType,
        CommunicationChannel channel,
        string subjectTemplate,
        string bodyTemplate,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        Code = code;
        Name = name;
        TemplateType = templateType;
        Channel = channel;
        SubjectTemplate = subjectTemplate;
        BodyTemplate = bodyTemplate;
        IsActive = true;
    }

    public (string Subject, string Body) Render(IDictionary<string, string> placeholders)
    {
        var renderedSubject = SubjectTemplate;
        var renderedBody = BodyTemplate;

        foreach (var (key, value) in placeholders)
        {
            var placeholderKey = $"{{{key}}}";
            renderedSubject = renderedSubject.Replace(placeholderKey, value);
            renderedBody = renderedBody.Replace(placeholderKey, value);
        }

        return (renderedSubject, renderedBody);
    }
}
