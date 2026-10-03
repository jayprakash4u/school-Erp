using AutoMapper;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Students;

namespace SchoolERP.Application.Students.Mapping;

public class StudentMappingProfile : Profile
{
    public StudentMappingProfile()
    {
        CreateMap<Student, StudentDto>()
            .ConstructUsing(s => new StudentDto(
                s.Id,
                s.OrganizationId,
                s.CampusId,
                s.AdmissionNumber,
                s.FirstName,
                s.MiddleName,
                s.LastName,
                s.FullName,
                s.Gender,
                s.DateOfBirth,
                s.Email,
                s.PhoneNumber,
                s.EmergencyContactNumber,
                s.BloodGroup,
                s.Nationality,
                s.AvatarUrl,
                s.Status,
                null, null, null, null, null, null, null,
                s.CreatedAtUtc
            ));

        CreateMap<StudentAddress, StudentAddressDto>();
    }
}
