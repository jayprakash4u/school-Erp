using SchoolERP.Application.Reports;
using SchoolERP.Contracts.Academics;
using SchoolERP.Contracts.Fees;
using SchoolERP.Contracts.Hostel;
using SchoolERP.Contracts.Library;
using SchoolERP.Contracts.Students;
using SchoolERP.Contracts.Transport;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Fees;
using SchoolERP.Domain.Entities.Hostel;
using SchoolERP.Domain.Entities.Library;
using SchoolERP.Domain.Entities.Organization;
using SchoolERP.Domain.Entities.Students;
using SchoolERP.Domain.Entities.Transport;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Reports;

public class FinancialAndOperationsReportsTests
{
    [Fact]
    public async Task Financial_And_Operations_Reports_ShouldCalculateAccurately()
    {
        // =========================================================================
        // 1. Arrange Master Data
        // =========================================================================
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new SchoolERP.Domain.Entities.Organization.Organization("SCH-FIN-OPS", "Cambridge High");
        context.Organizations.Add(org);

        var academicYear = new AcademicYear(org.Id, "2026/2027", "Academic Year 2026-27", new DateOnly(2026, 4, 1), new DateOnly(2027, 3, 31), isCurrent: true);
        context.AcademicYears.Add(academicYear);

        var academicLevel = new AcademicLevel(org.Id, "SEC", "Secondary Level", AcademicLevelCategory.Secondary);
        context.AcademicLevels.Add(academicLevel);

        var program = new SchoolERP.Domain.Entities.Academics.Program(org.Id, academicLevel.Id, "PROG-SEC", "Secondary");
        context.Programs.Add(program);

        var student = new Student(org.Id, "STU-100", "Bikash", "Pandey", Gender.Male, new DateOnly(2011, 6, 1));
        context.Students.Add(student);

        // =========================================================================
        // 2. Fees & Invoices
        // =========================================================================
        var inv1 = new Invoice(org.Id, "INV-001", student.Id, academicYear.Id, program.Id, new DateOnly(2026, 4, 1), new DateOnly(2026, 4, 15), 10000m, 0m, 10000m);
        inv1.PaidAmount = 10000m;
        inv1.Status = InvoiceStatus.Paid;

        var inv2 = new Invoice(org.Id, "INV-002", student.Id, academicYear.Id, program.Id, new DateOnly(2026, 5, 1), new DateOnly(2026, 5, 15), 15000m, 0m, 15000m);
        inv2.PaidAmount = 5000m;
        inv2.Status = InvoiceStatus.PartiallyPaid;

        var inv3 = new Invoice(org.Id, "INV-003", student.Id, academicYear.Id, program.Id, new DateOnly(2026, 6, 1), new DateOnly(2026, 6, 15), 5000m, 0m, 5000m);
        inv3.PaidAmount = 0m;
        inv3.Status = InvoiceStatus.Overdue;

        context.Invoices.AddRange(inv1, inv2, inv3);

        var pay1 = new Payment(org.Id, "PAY-001", student.Id, 10000m, PaymentMethod.Cash, new DateOnly(2026, 4, 10), "IDEMP-1", invoiceId: inv1.Id);
        var pay2 = new Payment(org.Id, "PAY-002", student.Id, 5000m, PaymentMethod.Online, new DateOnly(2026, 5, 10), "IDEMP-2", invoiceId: inv2.Id);
        context.Payments.AddRange(pay1, pay2);

        // =========================================================================
        // 3. Library Setup
        // =========================================================================
        var author = new Author(org.Id, "J.K. Rowling");
        var category = new BookCategory(org.Id, "FIC", "Fiction");
        context.Authors.Add(author);
        context.BookCategories.Add(category);

        var book = new Book(org.Id, "978-0439708180", "Harry Potter and the Sorcerer's Stone", author.Id, category.Id);
        var copy1 = new BookCopy(book.Id, "ACC-001") { Status = BookCopyStatus.Available };
        var copy2 = new BookCopy(book.Id, "ACC-002") { Status = BookCopyStatus.Available };
        var copy3 = new BookCopy(book.Id, "ACC-003") { Status = BookCopyStatus.Issued };
        book.Copies.Add(copy1);
        book.Copies.Add(copy2);
        book.Copies.Add(copy3);
        context.Books.Add(book);

        var member = new LibraryMember(org.Id, "LIB-001", MemberType.Student, studentId: student.Id);
        context.LibraryMembers.Add(member);

        var bookIssue = new BookIssue(org.Id, "ISS-001", copy3.Id, member.Id, new DateOnly(2026, 9, 1), new DateOnly(2026, 9, 15)) { Status = IssueStatus.Issued };
        context.BookIssues.Add(bookIssue);

        var fine = new LibraryFine(org.Id, "FINE-001", bookIssue.Id, member.Id, amount: 100m)
        {
            PaidAmount = 50m,
            Status = FineStatus.Pending
        };
        context.LibraryFines.Add(fine);

        // =========================================================================
        // 4. Transport Setup
        // =========================================================================
        var driver = new Driver(org.Id, "Bhesh Bahadur", "LIC-9988", new DateOnly(2029, 1, 1), "9800112233");
        context.Drivers.Add(driver);

        var vehicle = new Vehicle(org.Id, "BA-1-KHA-9999", VehicleType.Bus, "Tata City Bus", capacity: 40, assignedDriverId: driver.Id);
        context.Vehicles.Add(vehicle);

        var route = new Route(org.Id, "R-01", "Ring Road Circuit", "Lagankhel", "Lagankhel", 60, vehicleId: vehicle.Id);
        var stop1 = new RouteStop(org.Id, route.Id, "Koteshwor", 1, 1500m);
        var stop2 = new RouteStop(org.Id, route.Id, "Baneshwor", 2, 2000m);
        route.Stops.Add(stop1);
        route.Stops.Add(stop2);
        context.Routes.Add(route);

        var transportAssign = new TransportAssignment(org.Id, student.Id, academicYear.Id, route.Id, stop1.Id, 1500m, new DateOnly(2026, 4, 1), vehicleId: vehicle.Id);
        context.TransportAssignments.Add(transportAssign);

        // =========================================================================
        // 5. Hostel Setup
        // =========================================================================
        var hostel = new SchoolERP.Domain.Entities.Hostel.Hostel(org.Id, "HST-01", "Boys Hostel A", HostelType.Boys, "Campus Premises");
        var building = new Building(org.Id, hostel.Id, "BLD-01", "Block 1", 2);
        var floor = new Floor(org.Id, building.Id, 1, "First Floor");
        var room = new Room(org.Id, floor.Id, "101", RoomType.Double, 5000m, capacity: 2);
        var bed1 = new Bed(org.Id, room.Id, "101-A") { Status = BedStatus.Occupied };
        var bed2 = new Bed(org.Id, room.Id, "101-B") { Status = BedStatus.Available };
        room.Beds.Add(bed1);
        room.Beds.Add(bed2);
        floor.Rooms.Add(room);
        building.Floors.Add(floor);
        hostel.Buildings.Add(building);
        context.Hostels.Add(hostel);

        await context.SaveChangesAsync();

        // =========================================================================
        // 6. Assert Financial Reports
        // =========================================================================
        var feeCollectionHandler = new GetFeeCollectionReportQueryHandler(context);
        var collectionRes = await feeCollectionHandler.Handle(new GetFeeCollectionReportQuery(org.Id, new DateOnly(2026, 4, 1), new DateOnly(2026, 5, 31)), CancellationToken.None);

        Assert.True(collectionRes.IsSuccess);
        Assert.Equal(15000m, collectionRes.Value.TotalCollectedAmount);
        Assert.Equal(2, collectionRes.Value.TotalTransactionsCount);
        Assert.Equal(2, collectionRes.Value.PaymentMethods.Count);
        Assert.Contains(collectionRes.Value.PaymentMethods, m => m.PaymentMethod == "Cash" && m.TotalAmount == 10000m);
        Assert.Contains(collectionRes.Value.PaymentMethods, m => m.PaymentMethod == "Online" && m.TotalAmount == 5000m);

        var outstandingHandler = new GetOutstandingFeeReportQueryHandler(context);
        var outstandingRes = await outstandingHandler.Handle(new GetOutstandingFeeReportQuery(org.Id), CancellationToken.None);

        Assert.True(outstandingRes.IsSuccess);
        Assert.Equal(30000m, outstandingRes.Value.TotalInvoicedAmount);
        Assert.Equal(15000m, outstandingRes.Value.TotalPaidAmount);
        Assert.Equal(15000m, outstandingRes.Value.TotalOutstandingAmount);
        Assert.Equal(50m, outstandingRes.Value.CollectionRatePercentage);
        Assert.Equal(3, outstandingRes.Value.TotalInvoicesCount);
        Assert.Equal(1, outstandingRes.Value.FullyPaidInvoicesCount);
        Assert.Equal(1, outstandingRes.Value.PartiallyPaidInvoicesCount);
        Assert.Equal(1, outstandingRes.Value.OverdueInvoicesCount);
        Assert.Equal(2, outstandingRes.Value.OutstandingStudents.Count); // inv2 ($10k left) & inv3 ($5k left)

        // =========================================================================
        // 7. Assert Operations Reports (Library, Transport, Hostel)
        // =========================================================================
        var libraryReportHandler = new GetLibraryReportQueryHandler(context);
        var libraryRes = await libraryReportHandler.Handle(new GetLibraryReportQuery(org.Id), CancellationToken.None);

        Assert.True(libraryRes.IsSuccess);
        Assert.Equal(1, libraryRes.Value.TotalTitles);
        Assert.Equal(3, libraryRes.Value.TotalCopies);
        Assert.Equal(2, libraryRes.Value.AvailableCopies);
        Assert.Equal(1, libraryRes.Value.IssuedCopies);
        Assert.Equal(1, libraryRes.Value.OverdueIssuesCount);
        Assert.Equal(50m, libraryRes.Value.PendingFinesAmount);

        var transportReportHandler = new GetTransportReportQueryHandler(context);
        var transportRes = await transportReportHandler.Handle(new GetTransportReportQuery(org.Id), CancellationToken.None);

        Assert.True(transportRes.IsSuccess);
        Assert.Equal(1, transportRes.Value.TotalRoutes);
        Assert.Equal(2, transportRes.Value.TotalStops);
        Assert.Equal(1, transportRes.Value.TotalVehicles);
        Assert.Equal(40, transportRes.Value.TotalCapacity);
        Assert.Equal(1, transportRes.Value.AssignedStudentsCount);
        Assert.Equal(2.5m, transportRes.Value.OverallOccupancyPercentage); // 1 / 40 * 100 = 2.5%

        var hostelReportHandler = new GetHostelReportQueryHandler(context);
        var hostelRes = await hostelReportHandler.Handle(new GetHostelReportQuery(org.Id), CancellationToken.None);

        Assert.True(hostelRes.IsSuccess);
        Assert.Equal(1, hostelRes.Value.TotalHostels);
        Assert.Equal(1, hostelRes.Value.TotalBuildings);
        Assert.Equal(1, hostelRes.Value.TotalRooms);
        Assert.Equal(2, hostelRes.Value.TotalBeds);
        Assert.Equal(1, hostelRes.Value.OccupiedBeds);
        Assert.Equal(1, hostelRes.Value.AvailableBeds);
        Assert.Equal(50m, hostelRes.Value.OccupancyPercentage); // 1 / 2 * 100 = 50%
    }
}
