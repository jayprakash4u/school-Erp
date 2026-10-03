using SchoolERP.Application.Hostel;
using SchoolERP.Contracts.Hostel;
using SchoolERP.Domain.Entities.Organization;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Hostel;

public class HostelSetupTests
{
    [Fact]
    public async Task HostelSetup_Building_Floor_Room_Bed_Hierarchy_ShouldSucceed()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-01", "Greenwood High");
        context.Organizations.Add(org);
        await context.SaveChangesAsync();

        // 1. Create Hostel
        var hostelHandler = new CreateHostelCommandHandler(context);
        var hostelRes = await hostelHandler.Handle(new CreateHostelCommand(
            org.Id,
            "HST-BOYS-01",
            "Mount Everest Boys Hostel",
            HostelType.Boys,
            "North Campus Block B",
            WardenContactNumber: "9841999888"), CancellationToken.None);

        Assert.True(hostelRes.IsSuccess);
        Assert.Equal("HST-BOYS-01", hostelRes.Value.Code);
        Assert.Equal("Mount Everest Boys Hostel", hostelRes.Value.Name);
        Assert.Equal(HostelType.Boys, hostelRes.Value.HostelType);

        // 2. Reject duplicate Hostel Code
        var dupHostelRes = await hostelHandler.Handle(new CreateHostelCommand(
            org.Id,
            "HST-BOYS-01",
            "Duplicate Hostel",
            HostelType.Boys,
            "Address"), CancellationToken.None);

        Assert.False(dupHostelRes.IsSuccess);
        Assert.Equal("Hostel.CodeExists", dupHostelRes.Error.Code);

        // 3. Create Building
        var buildingHandler = new CreateBuildingCommandHandler(context);
        var bldRes = await buildingHandler.Handle(new CreateBuildingCommand(
            hostelRes.Value.Id,
            "BLK-A",
            "Block A - Senior Wing",
            TotalFloors: 3), CancellationToken.None);

        Assert.True(bldRes.IsSuccess);
        Assert.Equal("BLK-A", bldRes.Value.Code);
        Assert.Equal(3, bldRes.Value.TotalFloors);

        // 4. Create Floor
        var floorHandler = new CreateFloorCommandHandler(context);
        var floor1Res = await floorHandler.Handle(new CreateFloorCommand(
            bldRes.Value.Id,
            1,
            "First Floor"), CancellationToken.None);

        Assert.True(floor1Res.IsSuccess);
        Assert.Equal(1, floor1Res.Value.FloorNumber);
        Assert.Equal("First Floor", floor1Res.Value.FloorName);

        // 5. Create Room (Room 101 - Double room, with 2 initial beds)
        var roomHandler = new CreateRoomCommandHandler(context);
        var roomRes = await roomHandler.Handle(new CreateRoomCommand(
            floor1Res.Value.Id,
            "101",
            RoomType.Double,
            MonthlyFeeAmount: 5000.0m,
            Capacity: 2,
            InitialBedsCount: 2), CancellationToken.None);

        Assert.True(roomRes.IsSuccess);
        Assert.Equal("101", roomRes.Value.RoomNumber);
        Assert.Equal(2, roomRes.Value.Capacity);
        Assert.Equal(2, roomRes.Value.Beds.Count);
        Assert.Equal("101-B1", roomRes.Value.Beds[0].BedNumber);
        Assert.Equal(BedStatus.Available, roomRes.Value.Beds[0].Status);
        Assert.Equal("101-B2", roomRes.Value.Beds[1].BedNumber);
        Assert.Equal(BedStatus.Available, roomRes.Value.Beds[1].Status);

        // 6. Test Bed Capacity Limit on Room
        var bedHandler = new CreateBedCommandHandler(context);
        var extraBedRes = await bedHandler.Handle(new CreateBedCommand(
            roomRes.Value.Id,
            "101-B3"), CancellationToken.None);

        Assert.False(extraBedRes.IsSuccess);
        Assert.Equal("Room.CapacityFull", extraBedRes.Error.Code);

        // 7. Query Detailed Room
        var getRoomDetailHandler = new GetRoomByIdQueryHandler(context);
        var roomDetail = await getRoomDetailHandler.Handle(new GetRoomByIdQuery(roomRes.Value.Id), CancellationToken.None);

        Assert.True(roomDetail.IsSuccess);
        Assert.Equal("Block A - Senior Wing", roomDetail.Value.BuildingName);
        Assert.Equal("Mount Everest Boys Hostel", roomDetail.Value.HostelName);
        Assert.Equal(2, roomDetail.Value.Beds.Count);
    }
}
