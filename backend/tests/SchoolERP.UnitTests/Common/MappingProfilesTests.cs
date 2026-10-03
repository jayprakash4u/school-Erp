using AutoMapper;
using Microsoft.Extensions.DependencyInjection;
using SchoolERP.Application.Examinations.Mapping;
using SchoolERP.Application.Fees.Mapping;
using SchoolERP.Application.Hostel.Mapping;
using SchoolERP.Application.Inventory.Mapping;
using SchoolERP.Application.Library.Mapping;
using SchoolERP.Application.Settings.Mapping;
using SchoolERP.Application.Staff.Mapping;
using SchoolERP.Application.Students.Mapping;
using SchoolERP.Application.Transport.Mapping;
using SchoolERP.Contracts.Fees;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Fees;
using SchoolERP.Domain.Entities.Students;
using Xunit;

namespace SchoolERP.UnitTests.Common;

public class MappingProfilesTests
{
    private readonly IMapper _mapper;

    public MappingProfilesTests()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddAutoMapper(cfg =>
        {
            cfg.AddProfile<StudentMappingProfile>();
            cfg.AddProfile<FeeMappingProfile>();
            cfg.AddProfile<ExamMappingProfile>();
            cfg.AddProfile<StaffMappingProfile>();
            cfg.AddProfile<LibraryMappingProfile>();
            cfg.AddProfile<TransportMappingProfile>();
            cfg.AddProfile<HostelMappingProfile>();
            cfg.AddProfile<InventoryMappingProfile>();
            cfg.AddProfile<SettingMappingProfile>();
        });

        var serviceProvider = services.BuildServiceProvider();
        _mapper = serviceProvider.GetRequiredService<IMapper>();
    }

    [Fact]
    public void Student_To_StudentDto_ShouldMapFieldsAccurately()
    {
        var student = new Student(
            organizationId: Guid.NewGuid(),
            admissionNumber: "ADM-2026-001",
            firstName: "Sita",
            lastName: "Adhikari",
            gender: Gender.Female,
            dateOfBirth: new DateOnly(2011, 4, 15)
        );

        var dto = _mapper.Map<StudentDto>(student);

        Assert.NotNull(dto);
        Assert.Equal(student.Id, dto.Id);
        Assert.Equal("ADM-2026-001", dto.AdmissionNumber);
        Assert.Equal("Sita", dto.FirstName);
        Assert.Equal("Adhikari", dto.LastName);
        Assert.Equal(Gender.Female, dto.Gender);
    }

    [Fact]
    public void Invoice_To_InvoiceDto_ShouldMapFieldsAccurately()
    {
        var invoice = new Invoice(
            organizationId: Guid.NewGuid(),
            invoiceNumber: "INV-2026-001",
            studentId: Guid.NewGuid(),
            academicYearId: Guid.NewGuid(),
            programId: Guid.NewGuid(),
            issueDate: new DateOnly(2026, 4, 1),
            dueDate: new DateOnly(2026, 4, 30),
            subTotal: 12000m,
            discountAmount: 2000m,
            totalAmount: 10000m
        );

        var dto = _mapper.Map<InvoiceDto>(invoice);

        Assert.NotNull(dto);
        Assert.Equal("INV-2026-001", dto.InvoiceNumber);
        Assert.Equal(10000m, dto.TotalAmount);
        Assert.Equal(12000m, dto.SubTotal);
    }
}
