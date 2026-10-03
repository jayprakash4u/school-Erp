using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Academics;

namespace SchoolERP.Domain.Entities.Students;

public class Admission : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string ApplicationNumber { get; set; } = string.Empty;
    public string? AdmissionNumber { get; set; }

    public Guid AcademicYearId { get; set; }
    public AcademicYear AcademicYear { get; set; } = null!;

    public Guid ProgramId { get; set; }
    public Domain.Entities.Academics.Program Program { get; set; } = null!;

    public Guid? StreamId { get; set; }
    public Domain.Entities.Academics.Stream? Stream { get; set; }

    public DateOnly ApplicationDate { get; set; }
    public DateOnly? AdmissionDate { get; set; }
    public AdmissionStatus Status { get; set; } = AdmissionStatus.Applied;

    // Candidate snapshot
    public string CandidateFirstName { get; set; } = string.Empty;
    public string CandidateLastName { get; set; } = string.Empty;
    public Gender CandidateGender { get; set; } = Gender.Male;
    public DateOnly CandidateDateOfBirth { get; set; }
    public string? CandidateEmail { get; set; }
    public string? CandidatePhone { get; set; }

    // Guardian snapshot
    public string? GuardianName { get; set; }
    public string? GuardianPhone { get; set; }
    public string? GuardianEmail { get; set; }
    public GuardianRelationship? GuardianRelationship { get; set; }

    // Converted student reference
    public Guid? CreatedStudentId { get; set; }
    public Student? CreatedStudent { get; set; }

    public string? Remarks { get; set; }

    public Admission()
    {
        Id = Guid.NewGuid();
    }

    public Admission(
        Guid organizationId,
        string applicationNumber,
        Guid academicYearId,
        Guid programId,
        string candidateFirstName,
        string candidateLastName,
        Gender candidateGender,
        DateOnly candidateDateOfBirth,
        DateOnly applicationDate,
        Guid? streamId = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        ApplicationNumber = applicationNumber;
        AcademicYearId = academicYearId;
        ProgramId = programId;
        StreamId = streamId;
        CandidateFirstName = candidateFirstName;
        CandidateLastName = candidateLastName;
        CandidateGender = candidateGender;
        CandidateDateOfBirth = candidateDateOfBirth;
        ApplicationDate = applicationDate;
        Status = AdmissionStatus.Applied;
    }
}
