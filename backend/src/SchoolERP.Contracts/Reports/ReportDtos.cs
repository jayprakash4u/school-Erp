namespace SchoolERP.Contracts.Reports;

// =========================================================================
// 1. STUDENT REPORT DTOS
// =========================================================================

public record StudentReportDto(
    int TotalStudents,
    int ActiveStudents,
    int InactiveStudents,
    int GraduatedStudents,
    int MaleCount,
    int FemaleCount,
    int OtherGenderCount,
    IReadOnlyList<ProgramEnrollmentSummaryDto> Programs,
    IReadOnlyList<SectionEnrollmentSummaryDto> Sections);

public record ProgramEnrollmentSummaryDto(
    Guid ProgramId,
    string ProgramName,
    int TotalStudents,
    int MaleCount,
    int FemaleCount);

public record SectionEnrollmentSummaryDto(
    Guid? SectionId,
    string SectionName,
    int TotalStudents,
    int MaleCount,
    int FemaleCount);

// =========================================================================
// 2. ATTENDANCE REPORT DTOS
// =========================================================================

public record AttendanceReportDto(
    DateOnly FromDate,
    DateOnly ToDate,
    int TotalRecords,
    int PresentCount,
    int AbsentCount,
    int LateCount,
    int HalfDayCount,
    int ExcusedCount,
    int OnLeaveCount,
    decimal OverallAttendancePercentage,
    IReadOnlyList<DailyAttendanceTrendDto> DailyTrends,
    IReadOnlyList<SectionAttendanceSummaryDto> SectionBreakdown);

public record DailyAttendanceTrendDto(
    DateOnly Date,
    int TotalMarked,
    int PresentCount,
    int AbsentCount,
    decimal AttendancePercentage);

public record SectionAttendanceSummaryDto(
    string SectionName,
    int TotalRecords,
    int PresentCount,
    int AbsentCount,
    decimal AttendancePercentage);

// =========================================================================
// 3. FEE COLLECTION REPORT DTOS
// =========================================================================

public record FeeCollectionReportDto(
    DateOnly FromDate,
    DateOnly ToDate,
    decimal TotalCollectedAmount,
    int TotalTransactionsCount,
    IReadOnlyList<PaymentMethodBreakdownDto> PaymentMethods,
    IReadOnlyList<DailyCollectionDto> DailyCollections);

public record PaymentMethodBreakdownDto(
    string PaymentMethod,
    decimal TotalAmount,
    int TransactionCount,
    decimal Percentage);

public record DailyCollectionDto(
    DateOnly Date,
    decimal TotalAmount,
    int TransactionCount);

// =========================================================================
// 4. OUTSTANDING FEE REPORT DTOS
// =========================================================================

public record OutstandingFeeReportDto(
    decimal TotalInvoicedAmount,
    decimal TotalPaidAmount,
    decimal TotalOutstandingAmount,
    decimal CollectionRatePercentage,
    int TotalInvoicesCount,
    int FullyPaidInvoicesCount,
    int PartiallyPaidInvoicesCount,
    int IssuedInvoicesCount,
    int OverdueInvoicesCount,
    IReadOnlyList<StudentOutstandingItemDto> OutstandingStudents);

public record StudentOutstandingItemDto(
    Guid StudentId,
    string AdmissionNumber,
    string StudentName,
    string? ProgramOrSection,
    decimal InvoicedAmount,
    decimal PaidAmount,
    decimal OutstandingAmount,
    string InvoiceStatus);

// =========================================================================
// 5. EXAM RESULT REPORT DTOS
// =========================================================================

public record ExamResultReportDto(
    Guid ExamId,
    string ExamName,
    string? AcademicYearName,
    int TotalStudentsAppeared,
    int PassedStudentsCount,
    int FailedStudentsCount,
    decimal PassPercentage,
    decimal AverageMarks,
    IReadOnlyList<GradeDistributionDto> GradeDistribution,
    IReadOnlyList<SubjectPerformanceDto> SubjectPerformances,
    IReadOnlyList<TopPerformerDto> TopPerformers);

public record GradeDistributionDto(
    string GradeLabel,
    int StudentCount,
    decimal Percentage);

public record SubjectPerformanceDto(
    Guid SubjectId,
    string SubjectCode,
    string SubjectName,
    decimal AverageMarks,
    decimal HighestMarks,
    decimal LowestMarks,
    decimal PassPercentage);

public record TopPerformerDto(
    int Rank,
    Guid StudentId,
    string AdmissionNumber,
    string StudentName,
    decimal TotalMarksObtained,
    decimal Percentage,
    string FinalGrade);

// =========================================================================
// 6. STAFF REPORT DTOS
// =========================================================================

public record StaffReportDto(
    int TotalStaff,
    int TeachingStaffCount,
    int NonTeachingStaffCount,
    int ActiveStaffCount,
    IReadOnlyList<DepartmentStaffSummaryDto> Departments,
    IReadOnlyList<DesignationStaffSummaryDto> Designations);

public record DepartmentStaffSummaryDto(
    Guid? DepartmentId,
    string DepartmentName,
    int TotalStaff,
    int TeachingCount,
    int NonTeachingCount);

public record DesignationStaffSummaryDto(
    Guid? DesignationId,
    string DesignationTitle,
    int StaffCount);

// =========================================================================
// 7. LIBRARY REPORT DTOS
// =========================================================================

public record LibraryReportDto(
    int TotalTitles,
    int TotalCopies,
    int AvailableCopies,
    int IssuedCopies,
    int LostOrDamagedCopies,
    int TotalMembers,
    int OverdueIssuesCount,
    decimal TotalFinesCollected,
    decimal PendingFinesAmount,
    IReadOnlyList<PopularBookDto> PopularBooks);

public record PopularBookDto(
    Guid BookId,
    string Title,
    string ISBN,
    string? AuthorName,
    string? CategoryName,
    int TimesIssued);

// =========================================================================
// 8. TRANSPORT REPORT DTOS
// =========================================================================

public record TransportReportDto(
    int TotalRoutes,
    int TotalStops,
    int TotalVehicles,
    int TotalCapacity,
    int AssignedStudentsCount,
    decimal OverallOccupancyPercentage,
    IReadOnlyList<RouteSummaryDto> Routes);

public record RouteSummaryDto(
    Guid RouteId,
    string RouteNumber,
    string RouteName,
    string? VehicleNumber,
    string? DriverName,
    int Capacity,
    int AssignedStudents,
    decimal OccupancyPercentage);

// =========================================================================
// 9. HOSTEL REPORT DTOS
// =========================================================================

public record HostelReportDto(
    int TotalHostels,
    int TotalBuildings,
    int TotalRooms,
    int TotalBeds,
    int OccupiedBeds,
    int AvailableBeds,
    decimal OccupancyPercentage,
    IReadOnlyList<HostelSummaryDto> Hostels);

public record HostelSummaryDto(
    Guid HostelId,
    string HostelName,
    string HostelType,
    int TotalRooms,
    int TotalBeds,
    int OccupiedBeds,
    int AvailableBeds,
    decimal OccupancyPercentage);
