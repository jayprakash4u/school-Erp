using AutoMapper;
using SchoolERP.Contracts.Fees;
using SchoolERP.Domain.Entities.Fees;

namespace SchoolERP.Application.Fees.Mapping;

public class FeeMappingProfile : Profile
{
    public FeeMappingProfile()
    {
        CreateMap<FeeHead, FeeHeadDto>();
        CreateMap<Invoice, InvoiceDto>()
            .ConstructUsing(i => new InvoiceDto(
                i.Id,
                i.OrganizationId,
                i.CampusId,
                i.InvoiceNumber,
                i.StudentId,
                i.Student != null ? i.Student.FullName : string.Empty,
                i.Student != null ? i.Student.AdmissionNumber : string.Empty,
                null,
                i.AcademicYearId,
                i.AcademicYear != null ? i.AcademicYear.Name : string.Empty,
                i.ProgramId,
                i.Program != null ? i.Program.Name : string.Empty,
                i.IssueDate,
                i.DueDate,
                i.SubTotal,
                i.DiscountAmount,
                i.TotalAmount,
                i.PaidAmount,
                i.BalanceAmount,
                i.Status,
                new List<InvoiceItemDto>(),
                i.CreatedAtUtc
            ));
    }
}
