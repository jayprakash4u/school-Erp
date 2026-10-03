using AutoMapper;
using SchoolERP.Contracts.Staff;
using SchoolERP.Domain.Entities.Staff;

namespace SchoolERP.Application.Staff.Mapping;

public class StaffMappingProfile : Profile
{
    public StaffMappingProfile()
    {
        CreateMap<Department, DepartmentDto>();
        CreateMap<Designation, DesignationDto>();
        CreateMap<SchoolERP.Domain.Entities.Staff.Staff, StaffDto>();
        CreateMap<TeacherProfile, TeacherProfileDto>();
        CreateMap<TeacherAssignment, TeacherAssignmentDto>();
    }
}
