namespace SchoolERP.Contracts.Library;

// --- Author ---
public record AuthorDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string Name,
    string? Biography,
    bool IsActive);

public record CreateAuthorRequest(
    string Name,
    string? Biography = null,
    Guid? CampusId = null);

// --- Publisher ---
public record PublisherDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string Name,
    string? Address,
    string? ContactEmail,
    bool IsActive);

public record CreatePublisherRequest(
    string Name,
    string? Address = null,
    string? ContactEmail = null,
    Guid? CampusId = null);

// --- Book Category ---
public record BookCategoryDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string Code,
    string Name,
    string? Description,
    bool IsActive);

public record CreateBookCategoryRequest(
    string Code,
    string Name,
    string? Description = null,
    Guid? CampusId = null);

// --- Book & Copies ---
public record BookCopyDto(
    Guid Id,
    Guid BookId,
    string AccessionNumber,
    string? Barcode,
    BookCopyStatus Status,
    BookCondition Condition,
    string? ShelfLocation,
    decimal? Price);

public record BookDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string ISBN,
    string Title,
    string? Subtitle,
    Guid AuthorId,
    string AuthorName,
    Guid? PublisherId,
    string? PublisherName,
    Guid CategoryId,
    string CategoryName,
    string? Edition,
    int? PublishYear,
    string? Language,
    int TotalCopies,
    int AvailableCopies,
    string? RackNumber,
    string? ShelfNumber);

public record BookDetailDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string ISBN,
    string Title,
    string? Subtitle,
    Guid AuthorId,
    string AuthorName,
    Guid? PublisherId,
    string? PublisherName,
    Guid CategoryId,
    string CategoryName,
    string? Edition,
    int? PublishYear,
    string? Language,
    int TotalCopies,
    int AvailableCopies,
    string? RackNumber,
    string? ShelfNumber,
    IReadOnlyList<BookCopyDto> Copies);

public record CreateBookRequest(
    string ISBN,
    string Title,
    Guid AuthorId,
    Guid CategoryId,
    Guid? PublisherId = null,
    string? Subtitle = null,
    string? Edition = null,
    int? PublishYear = null,
    string? Language = "English",
    int InitialCopies = 1,
    decimal? PricePerCopy = null,
    string? ShelfLocation = null,
    string? RackNumber = null,
    string? ShelfNumber = null,
    Guid? CampusId = null);

public record AddBookCopyRequest(
    string AccessionNumber,
    string? Barcode = null,
    BookCondition Condition = BookCondition.New,
    string? ShelfLocation = null,
    decimal? Price = null);

// --- Library Member ---
public record LibraryMemberDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string MembershipNumber,
    MemberType MemberType,
    Guid? StudentId,
    string? StudentName,
    string? AdmissionNumber,
    Guid? StaffId,
    string? StaffName,
    string? EmployeeCode,
    int IssueLimit,
    int MaxIssueDays,
    decimal FinePerDay,
    MembershipStatus Status,
    int ActiveIssuedBooksCount,
    decimal TotalUnpaidFines,
    DateTime CreatedAtUtc);

public record RegisterLibraryMemberRequest(
    MemberType MemberType,
    Guid? StudentId = null,
    Guid? StaffId = null,
    int IssueLimit = 3,
    int MaxIssueDays = 14,
    decimal FinePerDay = 1.0m,
    Guid? CampusId = null);

// --- Circulation: Issue, Return & Fine ---
public record BookIssueDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string IssueNumber,
    Guid LibraryMemberId,
    string MemberName,
    string MembershipNumber,
    Guid BookCopyId,
    string AccessionNumber,
    string BookTitle,
    string ISBN,
    DateOnly IssueDate,
    DateOnly DueDate,
    DateOnly? ReturnedDate,
    IssueStatus Status,
    Guid? IssuedByStaffId,
    string? Remarks,
    BookReturnDto? ReturnDetails,
    LibraryFineDto? FineDetails,
    DateTime CreatedAtUtc);

public record IssueBookRequest(
    Guid LibraryMemberId,
    string AccessionNumber,
    DateOnly? IssueDate = null,
    Guid? IssuedByStaffId = null,
    string? Remarks = null,
    Guid? CampusId = null);

public record BookReturnDto(
    Guid Id,
    Guid BookIssueId,
    DateOnly ReturnDate,
    BookCondition ReceivedCondition,
    int OverdueDays,
    decimal FineAmount,
    Guid? ReceivedByStaffId,
    string? Remarks);

public record ReturnBookRequest(
    Guid BookIssueId,
    BookCondition ReceivedCondition = BookCondition.Good,
    DateOnly? ReturnDate = null,
    Guid? ReceivedByStaffId = null,
    string? Remarks = null);

public record LibraryFineDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string FineNumber,
    Guid BookIssueId,
    Guid LibraryMemberId,
    decimal Amount,
    decimal PaidAmount,
    FineStatus Status,
    DateOnly? PaidDate,
    string? PaymentReference,
    string? WaivedReason,
    DateTime CreatedAtUtc);

public record PayLibraryFineRequest(
    decimal Amount,
    string? PaymentReference = null);

public record WaiveLibraryFineRequest(
    string Reason);
