using AutoMapper;
using SchoolERP.Contracts.Settings;
using SchoolERP.Domain.Entities.Settings;

namespace SchoolERP.Application.Settings.Mapping;

public class SettingMappingProfile : Profile
{
    public SettingMappingProfile()
    {
        CreateMap<AppSetting, AppSettingDto>();
        CreateMap<DocumentSequence, DocumentSequenceDto>()
            .ForMember(d => d.ExamplePreview, opt => opt.MapFrom(s => s.PreviewNextNumber(null)));
    }
}
