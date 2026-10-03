using AutoMapper;
using SchoolERP.Contracts.Transport;
using SchoolERP.Domain.Entities.Transport;

namespace SchoolERP.Application.Transport.Mapping;

public class TransportMappingProfile : Profile
{
    public TransportMappingProfile()
    {
        CreateMap<Driver, DriverDto>();
        CreateMap<Vehicle, VehicleDto>();
        CreateMap<Route, RouteDto>();
        CreateMap<RouteStop, RouteStopDto>();
        CreateMap<TransportAssignment, TransportAssignmentDto>();
        CreateMap<TransportFee, TransportFeeDto>();
    }
}
