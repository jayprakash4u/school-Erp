using SchoolERP.Application.Documents;
using SchoolERP.Contracts.Documents;
using SchoolERP.Domain.Entities.Organization;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Documents;

public class DocumentSetupTests
{
    [Fact]
    public async Task DocumentCategory_And_TypeSetup_ShouldSucceed()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-01", "Greenwood High");
        context.Organizations.Add(org);
        await context.SaveChangesAsync();

        // 1. Create Document Category (Identity & Citizenship)
        var catHandler = new CreateDocumentCategoryCommandHandler(context);
        var catRes = await catHandler.Handle(new CreateDocumentCategoryCommand(
            org.Id,
            "CAT-IDENTITY",
            "Identity & Verification Documents",
            "National IDs, Passports, Birth Certificates"), CancellationToken.None);

        Assert.True(catRes.IsSuccess);
        Assert.Equal("CAT-IDENTITY", catRes.Value.Code);
        Assert.Equal("Identity & Verification Documents", catRes.Value.Name);

        // 2. Reject duplicate category code
        var dupCatRes = await catHandler.Handle(new CreateDocumentCategoryCommand(
            org.Id,
            "CAT-IDENTITY",
            "Duplicate Category"), CancellationToken.None);

        Assert.False(dupCatRes.IsSuccess);
        Assert.Equal("DocumentCategory.CodeExists", dupCatRes.Error.Code);

        // 3. Create Document Type: Student Citizenship
        var typeHandler = new CreateDocumentTypeCommandHandler(context);
        var typeRes = await typeHandler.Handle(new CreateDocumentTypeCommand(
            org.Id,
            catRes.Value.Id,
            "DOC-CITIZENSHIP",
            "National Citizenship / Birth Certificate",
            DocumentOwnerType.Student,
            IsRequiredForAdmission: true,
            MaxFileSizeBytes: 5242880, // 5 MB
            AllowedExtensions: ".pdf,.jpg,.jpeg"), CancellationToken.None);

        Assert.True(typeRes.IsSuccess);
        Assert.Equal("DOC-CITIZENSHIP", typeRes.Value.Code);
        Assert.Equal(DocumentOwnerType.Student, typeRes.Value.AllowedOwnerType);
        Assert.True(typeRes.Value.IsRequiredForAdmission);
        Assert.Equal(5242880, typeRes.Value.MaxFileSizeBytes);

        // 4. Query Categories and Types
        var getCategoriesHandler = new GetDocumentCategoriesQueryHandler(context);
        var catList = await getCategoriesHandler.Handle(new GetDocumentCategoriesQuery(org.Id), CancellationToken.None);
        Assert.True(catList.IsSuccess);
        Assert.Single(catList.Value);
        Assert.Equal(1, catList.Value[0].TotalTypes);

        var getTypesHandler = new GetDocumentTypesQueryHandler(context);
        var typesList = await getTypesHandler.Handle(new GetDocumentTypesQuery(org.Id, catRes.Value.Id), CancellationToken.None);
        Assert.True(typesList.IsSuccess);
        Assert.Single(typesList.Value);
        Assert.Equal("National Citizenship / Birth Certificate", typesList.Value[0].Name);
    }
}
