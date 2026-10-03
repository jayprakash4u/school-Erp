using SchoolERP.Application.Transport;
using SchoolERP.Contracts.Transport;
using SchoolERP.Domain.Entities.Organization;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Transport;

public class TransportSetupTests
{
    [Fact]
    public async Task TransportSetup_Driver_Vehicle_Route_ShouldSucceed()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-01", "Greenwood High");
        context.Organizations.Add(org);
        await context.SaveChangesAsync();

        // 1. Create Driver
        var driverHandler = new CreateDriverCommandHandler(context);
        var driverRes = await driverHandler.Handle(new CreateDriverCommand(
            org.Id,
            "Som Bahadur Thapa",
            "DL-987654321",
            new DateOnly(2030, 12, 31),
            "9841234567",
            EmergencyContact: "9801234567",
            ExperienceYears: 8), CancellationToken.None);

        Assert.True(driverRes.IsSuccess);
        Assert.Equal("Som Bahadur Thapa", driverRes.Value.FullName);
        Assert.Equal("DL-987654321", driverRes.Value.LicenseNumber);
        Assert.True(driverRes.Value.IsActive);

        // 2. Reject duplicate Driver license
        var dupDriverRes = await driverHandler.Handle(new CreateDriverCommand(
            org.Id,
            "Another Driver",
            "DL-987654321",
            new DateOnly(2028, 5, 1),
            "9811111111"), CancellationToken.None);

        Assert.False(dupDriverRes.IsSuccess);
        Assert.Equal("Driver.LicenseExists", dupDriverRes.Error.Code);

        // 3. Create Vehicle and assign Driver
        var vehicleHandler = new CreateVehicleCommandHandler(context);
        var vehicleRes = await vehicleHandler.Handle(new CreateVehicleCommand(
            org.Id,
            "BA-1-KHA-9090",
            VehicleType.Bus,
            "Tata Starbus 40 Seater",
            Capacity: 40,
            AssignedDriverId: driverRes.Value.Id,
            GPSDeviceNumber: "GPS-TATA-01",
            InsuranceExpiryDate: new DateOnly(2027, 8, 15),
            FitnessCertExpiryDate: new DateOnly(2027, 9, 1)), CancellationToken.None);

        Assert.True(vehicleRes.IsSuccess);
        Assert.Equal("BA-1-KHA-9090", vehicleRes.Value.RegistrationNumber);
        Assert.Equal(40, vehicleRes.Value.Capacity);
        Assert.Equal("Som Bahadur Thapa", vehicleRes.Value.DriverName);

        // 4. Create Route with Stops
        var routeHandler = new CreateRouteCommandHandler(context);
        var stops = new List<CreateRouteStopRequest>
        {
            new("Kalanki Gate", 1, 1500.0m, PickupTime: new TimeOnly(7, 15), DropTime: new TimeOnly(16, 15), DistanceKm: 5.0m),
            new("Balkhu Chowk", 2, 1800.0m, PickupTime: new TimeOnly(7, 30), DropTime: new TimeOnly(16, 0), DistanceKm: 8.0m),
            new("Ekantakuna", 3, 2200.0m, PickupTime: new TimeOnly(7, 45), DropTime: new TimeOnly(15, 45), DistanceKm: 12.0m)
        };

        var routeRes = await routeHandler.Handle(new CreateRouteCommand(
            org.Id,
            "ROUTE-01",
            "Kalanki to School Main Gate",
            "Kalanki",
            "School Campus",
            EstimatedDurationMinutes: 45,
            stops,
            VehicleId: vehicleRes.Value.Id), CancellationToken.None);

        Assert.True(routeRes.IsSuccess);
        Assert.Equal("ROUTE-01", routeRes.Value.Code);
        Assert.Equal(3, routeRes.Value.Stops.Count);
        Assert.Equal("BA-1-KHA-9090", routeRes.Value.VehicleRegistrationNumber);
        Assert.Equal("Som Bahadur Thapa", routeRes.Value.DriverName);

        // 5. Query Routes
        var getRoutesHandler = new GetRoutesQueryHandler(context);
        var routesList = await getRoutesHandler.Handle(new GetRoutesQuery(org.Id), CancellationToken.None);
        Assert.True(routesList.IsSuccess);
        Assert.Single(routesList.Value);
        Assert.Equal(3, routesList.Value[0].StopCount);
    }
}
