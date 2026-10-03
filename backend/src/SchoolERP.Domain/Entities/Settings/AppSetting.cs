using SchoolERP.Contracts.Settings;
using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Settings;

public class AppSetting : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public SettingCategory Category { get; set; } = SettingCategory.General;
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public SettingDataType DataType { get; set; } = SettingDataType.String;
    public string? Description { get; set; }
    public bool IsEncrypted { get; set; } = false;
    public bool IsPublic { get; set; } = false;

    public AppSetting()
    {
        Id = Guid.NewGuid();
    }

    public AppSetting(
        Guid organizationId,
        SettingCategory category,
        string key,
        string value,
        SettingDataType dataType = SettingDataType.String,
        string? description = null,
        bool isEncrypted = false,
        bool isPublic = false,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        Category = category;
        Key = key;
        Value = value;
        DataType = dataType;
        Description = description;
        IsEncrypted = isEncrypted;
        IsPublic = isPublic;
    }
}
