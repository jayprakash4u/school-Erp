using SchoolERP.Application.Communication;
using SchoolERP.Contracts.Academics;
using SchoolERP.Contracts.Communication;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Identity;
using SchoolERP.Domain.Entities.Organization;
using SchoolERP.Domain.Entities.Students;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Communication;

public class AnnouncementAndRecipientTests
{
    [Fact]
    public async Task Admin_Announcement_TargetGrade10_ShouldResolveStudentsAndParentsAsRecipients()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-01", "Greenwood High");
        context.Organizations.Add(org);

        var adminUser = new User("admin@greenwood.edu", "Admin", "User", "9841000000");
        context.Users.Add(adminUser);

        var ay = new AcademicYear(org.Id, "2026-2027", "2026/27", new DateOnly(2026, 4, 1), new DateOnly(2027, 3, 31), isCurrent: true);
        context.AcademicYears.Add(ay);

        var level = new AcademicLevel(org.Id, "SEC", "Secondary", AcademicLevelCategory.Secondary);
        context.AcademicLevels.Add(level);

        var grade10 = new Domain.Entities.Academics.Program(org.Id, level.Id, "G10", "Grade 10", 1, 1);
        var grade9 = new Domain.Entities.Academics.Program(org.Id, level.Id, "G9", "Grade 9", 1, 1);
        context.Programs.AddRange(grade10, grade9);

        var sec10A = new Section(org.Id, grade10.Id, ay.Id, "10A", "Section A", 40);
        context.Sections.Add(sec10A);

        // Students
        var ram = new Student(org.Id, "RAM-001", "Ram", "Sharma", Gender.Male, new DateOnly(2010, 5, 1));
        ram.Email = "ram@student.edu";
        ram.PhoneNumber = "9841111111";

        var hari = new Student(org.Id, "HARI-002", "Hari", "KC", Gender.Male, new DateOnly(2010, 6, 1));
        hari.Email = "hari@student.edu";
        hari.PhoneNumber = "9841222222";

        var sitaGrade9 = new Student(org.Id, "SITA-003", "Sita", "Giri", Gender.Female, new DateOnly(2011, 7, 1));
        context.Students.AddRange(ram, hari, sitaGrade9);

        // Guardians for Ram & Hari
        var ramFather = new Guardian(org.Id, "Dasharath", "Sharma", phoneNumber: "9841999991", email: "dasharath@gmail.com");
        var hariMother = new Guardian(org.Id, "Kaushalya", "KC", phoneNumber: "9841999992", email: "kaushalya@gmail.com");
        context.Guardians.AddRange(ramFather, hariMother);

        // Student-Guardian link
        var sgRam = new StudentGuardian { StudentId = ram.Id, GuardianId = ramFather.Id, Relationship = GuardianRelationship.Father, IsPrimary = true, Guardian = ramFather };
        ram.StudentGuardians.Add(sgRam);

        var sgHari = new StudentGuardian { StudentId = hari.Id, GuardianId = hariMother.Id, Relationship = GuardianRelationship.Mother, IsPrimary = true, Guardian = hariMother };
        hari.StudentGuardians.Add(sgHari);

        // Enrollments
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var enRam = new Enrollment(ram.Id, ay.Id, grade10.Id, today, sectionId: sec10A.Id, rollNumber: "10-A-01");
        enRam.Student = ram;
        var enHari = new Enrollment(hari.Id, ay.Id, grade10.Id, today, sectionId: sec10A.Id, rollNumber: "10-A-02");
        enHari.Student = hari;
        var enSita = new Enrollment(sitaGrade9.Id, ay.Id, grade9.Id, today, rollNumber: "9-01");
        enSita.Student = sitaGrade9;
        context.Enrollments.AddRange(enRam, enHari, enSita);

        await context.SaveChangesAsync();

        // 1. Admin publishes Announcement for Grade 10 (Students + Parents)
        var announcementHandler = new CreateAnnouncementCommandHandler(context);
        var createCmd = new CreateAnnouncementCommand(
            org.Id,
            adminUser.Id,
            "Grade 10 Parent-Teacher Meeting",
            "Annual PTM will be held on Friday at 10:00 AM in the auditorium.",
            AnnouncementPriority.Important,
            TargetAudienceType.StudentsAndGuardiansOfProgram,
            ProgramId: grade10.Id,
            SendEmail: true);

        var annRes = await announcementHandler.Handle(createCmd, CancellationToken.None);

        Assert.True(annRes.IsSuccess);
        Assert.Equal("Grade 10 Parent-Teacher Meeting", annRes.Value.Title);
        Assert.Equal("Grade 10", annRes.Value.ProgramName);
        Assert.Equal("Admin User", annRes.Value.PublishedByName);

        // Should resolve 4 recipients: Ram (student), Dasharath (guardian), Hari (student), Kaushalya (guardian)
        Assert.Equal(4, annRes.Value.Recipients.Count);

        var ramRec = annRes.Value.Recipients.FirstOrDefault(r => r.RecipientType == RecipientType.Student && r.RecipientName == "Ram Sharma");
        Assert.NotNull(ramRec);
        Assert.Equal("ram@student.edu", ramRec.Email);
        Assert.Equal(DeliveryStatus.Sent, ramRec.Status);

        var fatherRec = annRes.Value.Recipients.FirstOrDefault(r => r.RecipientType == RecipientType.Guardian && r.RecipientName == "Dasharath Sharma");
        Assert.NotNull(fatherRec);
        Assert.Equal("dasharath@gmail.com", fatherRec.Email);

        // 2. Mark Announcement as Read by Ram
        var markReadHandler = new MarkAnnouncementReadCommandHandler(context);
        var markRes = await markReadHandler.Handle(new MarkAnnouncementReadCommand(ramRec.Id), CancellationToken.None);
        Assert.True(markRes.IsSuccess);

        // 3. Query Announcements
        var getAnnouncementsHandler = new GetAnnouncementsQueryHandler(context);
        var listRes = await getAnnouncementsHandler.Handle(new GetAnnouncementsQuery(org.Id), CancellationToken.None);
        Assert.True(listRes.IsSuccess);
        Assert.Single(listRes.Value);
        Assert.Equal(4, listRes.Value[0].TotalRecipients);
        Assert.Equal(1, listRes.Value[0].ReadCount); // 1 read so far
    }
}
