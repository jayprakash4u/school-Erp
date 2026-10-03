using AutoMapper;
using SchoolERP.Contracts.Hostel;
using SchoolERP.Domain.Entities.Hostel;

namespace SchoolERP.Application.Hostel.Mapping;

public class HostelMappingProfile : Profile
{
    public HostelMappingProfile()
    {
        CreateMap<SchoolERP.Domain.Entities.Hostel.Hostel, HostelDto>();
        CreateMap<Building, BuildingDto>();
        CreateMap<Floor, FloorDto>();
        CreateMap<Room, RoomDto>();
        CreateMap<Bed, BedDto>();
        CreateMap<HostelAllocation, HostelAllocationDto>();
        CreateMap<HostelFee, HostelFeeDto>();
        CreateMap<HostelAttendance, HostelAttendanceRecordDto>();
    }
}
