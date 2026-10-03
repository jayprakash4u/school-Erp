using SchoolERP.Application.Communication;
using SchoolERP.Contracts.Communication;
using SchoolERP.Domain.Entities.Identity;
using SchoolERP.Domain.Entities.Organization;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Communication;

public class NotificationMessageAndTemplateTests
{
    [Fact]
    public async Task Notification_DirectMessage_And_TemplateRendering_ShouldWorkCorrectly()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-01", "Greenwood High");
        context.Organizations.Add(org);

        var teacher = new User("teacher@greenwood.edu", "Gita", "Adhikari", "9841000001");
        var parent = new User("parent@gmail.com", "Bikram", "Shrestha", "9841000002");
        context.Users.AddRange(teacher, parent);
        await context.SaveChangesAsync();

        // 1. Create and Render Communication Template
        var templateHandler = new CreateCommunicationTemplateCommandHandler(context);
        var tplRes = await templateHandler.Handle(new CreateCommunicationTemplateCommand(
            org.Id,
            "FEE_REMINDER",
            "Monthly Fee Reminder Template",
            TemplateType.FeeReminder,
            CommunicationChannel.SMS,
            "Fee Reminder for {Month}",
            "Dear {ParentName}, the tuition fee of Rs. {Amount} for {StudentName} is due on {DueDate}. Please pay before due date."), CancellationToken.None);

        Assert.True(tplRes.IsSuccess);
        Assert.Equal("FEE_REMINDER", tplRes.Value.Code);

        // Render Template
        var renderHandler = new RenderCommunicationTemplateQueryHandler(context);
        var placeholders = new Dictionary<string, string>
        {
            { "Month", "April 2026" },
            { "ParentName", "Bikram Shrestha" },
            { "Amount", "6,500" },
            { "StudentName", "Aayush Shrestha" },
            { "DueDate", "2026-04-10" }
        };

        var renderRes = await renderHandler.Handle(new RenderCommunicationTemplateQuery(tplRes.Value.Id, placeholders), CancellationToken.None);
        Assert.True(renderRes.IsSuccess);
        Assert.Equal("Fee Reminder for April 2026", renderRes.Value.Subject);
        Assert.Equal("Dear Bikram Shrestha, the tuition fee of Rs. 6,500 for Aayush Shrestha is due on 2026-04-10. Please pay before due date.", renderRes.Value.Body);

        // 2. Direct Messaging: Teacher sends message to Parent
        var msgHandler = new SendDirectMessageCommandHandler(context);
        var msgRes = await msgHandler.Handle(new SendDirectMessageCommand(
            org.Id,
            teacher.Id,
            parent.Id,
            "Science Project Submission",
            "Please ensure Aayush brings his science model on Monday."), CancellationToken.None);

        Assert.True(msgRes.IsSuccess);
        Assert.Equal("Gita Adhikari", msgRes.Value.SenderName);
        Assert.Equal("Bikram Shrestha", msgRes.Value.RecipientName);
        Assert.False(msgRes.Value.IsRead);

        // 3. Verify Parent's Inbox & In-App Notifications
        var inboxHandler = new GetUserInboxQueryHandler(context);
        var inboxRes = await inboxHandler.Handle(new GetUserInboxQuery(parent.Id), CancellationToken.None);
        Assert.True(inboxRes.IsSuccess);
        Assert.Single(inboxRes.Value);
        Assert.Equal("Science Project Submission", inboxRes.Value[0].Subject);

        var notifHandler = new GetUserNotificationsQueryHandler(context);
        var notifRes = await notifHandler.Handle(new GetUserNotificationsQuery(parent.Id), CancellationToken.None);
        Assert.True(notifRes.IsSuccess);
        Assert.Single(notifRes.Value);
        Assert.Equal("New Message: Science Project Submission", notifRes.Value[0].Title);

        // 4. Mark Notification as Read
        var markNotifHandler = new MarkNotificationAsReadCommandHandler(context);
        var markNotifRes = await markNotifHandler.Handle(new MarkNotificationAsReadCommand(notifRes.Value[0].Id), CancellationToken.None);
        Assert.True(markNotifRes.IsSuccess);

        var unreadNotifs = await notifHandler.Handle(new GetUserNotificationsQuery(parent.Id, UnreadOnly: true), CancellationToken.None);
        Assert.True(unreadNotifs.IsSuccess);
        Assert.Empty(unreadNotifs.Value);
    }
}
