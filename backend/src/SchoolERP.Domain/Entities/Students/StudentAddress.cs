using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Students;

public class StudentAddress : AuditableEntity<Guid>
{
    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public AddressType Type { get; set; } = AddressType.Current;
    public string AddressLine1 { get; set; } = string.Empty;
    public string? AddressLine2 { get; set; }
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;

    public StudentAddress()
    {
        Id = Guid.NewGuid();
    }

    public StudentAddress(
        Guid studentId,
        AddressType type,
        string addressLine1,
        string city,
        string state,
        string country,
        string postalCode,
        string? addressLine2 = null)
    {
        Id = Guid.NewGuid();
        StudentId = studentId;
        Type = type;
        AddressLine1 = addressLine1;
        AddressLine2 = addressLine2;
        City = city;
        State = state;
        Country = country;
        PostalCode = postalCode;
    }
}
