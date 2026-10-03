namespace SchoolERP.Contracts.Documents;

public enum DocumentOwnerType
{
    Student = 1,
    Staff = 2,
    Admission = 3,
    AcademicYear = 4,
    Organization = 5,
    General = 6
}

public enum DocumentSecurityLevel
{
    Public = 1,
    Internal = 2,
    Confidential = 3,
    Restricted = 4
}

public enum DocumentAccessPermission
{
    Read = 1,
    Download = 2,
    Manage = 3
}

public enum StorageProvider
{
    LocalStorage = 1,
    AzureBlob = 2,
    AmazonS3 = 3,
    GoogleCloudStorage = 4
}
