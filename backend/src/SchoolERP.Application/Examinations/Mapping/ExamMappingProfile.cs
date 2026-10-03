using AutoMapper;
using SchoolERP.Contracts.Examinations;
using SchoolERP.Domain.Entities.Examinations;

namespace SchoolERP.Application.Examinations.Mapping;

public class ExamMappingProfile : Profile
{
    public ExamMappingProfile()
    {
        CreateMap<ExamType, ExamTypeDto>();
        CreateMap<GradingScale, GradingScaleDto>();
        CreateMap<GradeRule, GradeRuleDto>();
        CreateMap<Exam, ExamDto>();
        CreateMap<ExamSubject, ExamSubjectDto>();
        CreateMap<MarksEntry, MarksEntryDto>();
        CreateMap<ExamResult, ExamResultDto>();
        CreateMap<ReportCard, ReportCardDto>();
    }
}
