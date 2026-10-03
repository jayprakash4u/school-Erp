using SchoolERP.Application.Documents;
using SchoolERP.Contracts.Documents;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Documents;
using SchoolERP.Domain.Entities.Identity;
using SchoolERP.Domain.Entities.Organization;
using SchoolERP.Domain.Entities.Students;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Documents;

public class DocumentManagementAndAccessTests
{
    [Fact]
    public async Task DocumentMetadata_Validation_Verification_AndAccessGrants_ShouldWorkAccurately()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-01", "Greenwood High");
        context.Organizations.Add(org);

        var staffUser = new User("staff@greenwood.edu", "Hari", "Officer", "9841000001");
        var adminUser = new User("admin@greenwood.edu", "Admin", "User", "9841000002");
        context.Users.AddRange(staffUser, adminUser);

        var student = new Student(org.Id, "RAM-001", "Ram", "Sharma", Gender.Male, new DateOnly(2010, 5, 1));
        context.Students.Add(student);

        var category = new DocumentCategory(org.Id, "CAT-STUDENT", "Student Records", "Academic & personal student documents");
        context.DocumentCategories.Add(category);

        var docType = new DocumentType(
            org.Id,
            category.Id,
            "DOC-CITIZENSHIP",
            "Student Citizenship",
            DocumentOwnerType.Student,
            isRequiredForAdmission: true,
            maxFileSizeBytes: 5242880, // 5 MB
            allowedExtensions: ".pdf,.jpg,.jpeg");
        context.DocumentTypes.Add(docType);

        await context.SaveChangesAsync();

        // 1. Upload Student Document Metadata (Valid PDF)
        var uploadHandler = new UploadDocumentMetadataCommandHandler(context);
        var uploadRes = await uploadHandler.Handle(new UploadDocumentMetadataCommand(
            org.Id,
            staffUser.Id,
            docType.Id,
            "Ram Sharma Citizenship Scan",
            "ram_citizenship.pdf",
            "documents/org-1/students/ram_citizenship_uuid.pdf",
            "application/pdf",
            FileSizeBytes: 1048576, // 1 MB
            FileHashSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            SecurityLevel: DocumentSecurityLevel.Confidential,
            OwnerType: DocumentOwnerType.Student,
            OwnerEntityId: student.Id), CancellationToken.None);

        Assert.True(uploadRes.IsSuccess);
        Assert.Equal("Ram Sharma Citizenship Scan", uploadRes.Value.Title);
        Assert.Equal("ram_citizenship.pdf", uploadRes.Value.FileName);
        Assert.Equal("Student Citizenship", uploadRes.Value.DocumentTypeName);
        Assert.False(uploadRes.Value.IsVerified);

        // 2. Test File Extension Restriction (Rejecting .exe)
        var exeRes = await uploadHandler.Handle(new UploadDocumentMetadataCommand(
            org.Id,
            staffUser.Id,
            docType.Id,
            "Malicious File",
            "setup.exe",
            "documents/setup.exe",
            "application/x-msdownload",
            FileSizeBytes: 2048,
            OwnerType: DocumentOwnerType.Student,
            OwnerEntityId: student.Id), CancellationToken.None);

        Assert.False(exeRes.IsSuccess);
        Assert.Equal("Document.ExtensionNotAllowed", exeRes.Error.Code);

        // 3. Test File Size Restriction (Rejecting 10MB > 5MB limit)
        var sizeRes = await uploadHandler.Handle(new UploadDocumentMetadataCommand(
            org.Id,
            staffUser.Id,
            docType.Id,
            "Oversized Scan",
            "large_scan.pdf",
            "documents/large_scan.pdf",
            "application/pdf",
            FileSizeBytes: 10485760, // 10 MB > 5 MB
            OwnerType: DocumentOwnerType.Student,
            OwnerEntityId: student.Id), CancellationToken.None);

        Assert.False(sizeRes.IsSuccess);
        Assert.Equal("Document.FileSizeExceeded", sizeRes.Error.Code);

        // 4. Admin Verifies the Document
        var verifyHandler = new VerifyDocumentCommandHandler(context);
        var verifyRes = await verifyHandler.Handle(new VerifyDocumentCommand(
            uploadRes.Value.Id,
            adminUser.Id,
            IsVerified: true,
            VerificationNotes: "Verified against original citizenship card"), CancellationToken.None);

        Assert.True(verifyRes.IsSuccess);
        Assert.True(verifyRes.Value.IsVerified);
        Assert.Equal("Verified against original citizenship card", verifyRes.Value.VerificationNotes);

        // 5. Grant Document Access to Staff User
        var grantHandler = new GrantDocumentAccessCommandHandler(context);
        var grantRes = await grantHandler.Handle(new GrantDocumentAccessCommand(
            uploadRes.Value.Id,
            DocumentAccessPermission.Download,
            GrantedToUserId: staffUser.Id), CancellationToken.None);

        Assert.True(grantRes.IsSuccess);
        Assert.Equal(staffUser.Id, grantRes.Value.GrantedToUserId);
        Assert.Equal("Hari Officer", grantRes.Value.GrantedToUserName);
        Assert.Equal(DocumentAccessPermission.Download, grantRes.Value.Permission);

        // 6. Query Documents by Student Owner ID
        var getDocsHandler = new GetDocumentsQueryHandler(context);
        var studentDocs = await getDocsHandler.Handle(new GetDocumentsQuery(
            org.Id,
            OwnerType: DocumentOwnerType.Student,
            OwnerEntityId: student.Id), CancellationToken.None);

        Assert.True(studentDocs.IsSuccess);
        Assert.Single(studentDocs.Value);
        Assert.Equal("Ram Sharma Citizenship Scan", studentDocs.Value[0].Title);

        // 7. Query Detailed Document with Access Grants
        var getDocDetailHandler = new GetDocumentByIdQueryHandler(context);
        var docDetail = await getDocDetailHandler.Handle(new GetDocumentByIdQuery(uploadRes.Value.Id), CancellationToken.None);

        Assert.True(docDetail.IsSuccess);
        Assert.True(docDetail.Value.IsVerified);
        Assert.Equal("Admin User", docDetail.Value.VerifiedByUserName);
        Assert.Single(docDetail.Value.AccessGrants);
        Assert.Equal("Hari Officer", docDetail.Value.AccessGrants[0].GrantedToUserName);
    }
}
