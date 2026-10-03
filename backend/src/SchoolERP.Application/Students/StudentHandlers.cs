using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Students;

namespace SchoolERP.Application.Students;

// --- Commands ---
public record CreateStudentCommand(
    Guid OrganizationId,
    string AdmissionNumber,
    string FirstName,
    string? MiddleName,
    string LastName,
    Gender Gender,
    DateOnly DateOfBirth,
    string? Email = null,
    string? PhoneNumber = null,
    string? EmergencyContactNumber = null,
    string? BloodGroup = null,
    string? Nationality = null,
    string? Religion = null,
    string? Category = null,
    string? AadharOrNationalId = null,
    string? AvatarUrl = null,
    Guid? CampusId = null,
    Guid? InitialAcademicYearId = null,
    Guid? InitialProgramId = null,
    Guid? InitialStreamId = null,
    Guid? InitialSectionId = null,
    Guid? InitialBatchId = null,
    string? InitialRollNumber = null,
    CreateGuardianRequest? PrimaryGuardian = null,
    CreateStudentAddressRequest? Address = null) : IRequest<Result<StudentDto>>;

public class CreateStudentCommandValidator : AbstractValidator<CreateStudentCommand>
{
    public CreateStudentCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.AdmissionNumber).NotEmpty().MaximumLength(50);
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DateOfBirth).NotEmpty();
    }
}

public class CreateStudentCommandHandler : IRequestHandler<CreateStudentCommand, Result<StudentDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateStudentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<StudentDto>> Handle(CreateStudentCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.Students
            .AnyAsync(s => s.OrganizationId == request.OrganizationId && s.AdmissionNumber == request.AdmissionNumber.Trim(), cancellationToken);

        if (exists)
        {
            return Result.Failure<StudentDto>(Error.Conflict("Student.DuplicateAdmissionNumber", $"Admission number '{request.AdmissionNumber}' already exists in this organization."));
        }

        var student = new Student(
            request.OrganizationId,
            request.AdmissionNumber.Trim(),
            request.FirstName.Trim(),
            request.LastName.Trim(),
            request.Gender,
            request.DateOfBirth,
            request.MiddleName?.Trim(),
            request.CampusId)
        {
            Email = request.Email?.Trim().ToLowerInvariant(),
            PhoneNumber = request.PhoneNumber?.Trim(),
            EmergencyContactNumber = request.EmergencyContactNumber?.Trim(),
            BloodGroup = request.BloodGroup?.Trim(),
            Nationality = request.Nationality?.Trim(),
            Religion = request.Religion?.Trim(),
            Category = request.Category?.Trim(),
            AadharOrNationalId = request.AadharOrNationalId?.Trim(),
            AvatarUrl = request.AvatarUrl?.Trim(),
            Status = StudentStatus.Active
        };

        // Address
        if (request.Address != null)
        {
            var addr = new StudentAddress(
                student.Id,
                request.Address.Type,
                request.Address.AddressLine1.Trim(),
                request.Address.City.Trim(),
                request.Address.State.Trim(),
                request.Address.Country.Trim(),
                request.Address.PostalCode.Trim(),
                request.Address.AddressLine2?.Trim());
            student.Addresses.Add(addr);
        }

        // Primary Guardian
        if (request.PrimaryGuardian != null)
        {
            var guardian = new Guardian(
                request.OrganizationId,
                request.PrimaryGuardian.FirstName.Trim(),
                request.PrimaryGuardian.LastName.Trim(),
                request.PrimaryGuardian.PhoneNumber?.Trim(),
                request.PrimaryGuardian.Email?.Trim(),
                request.CampusId)
            {
                Occupation = request.PrimaryGuardian.Occupation?.Trim(),
                AnnualIncome = request.PrimaryGuardian.AnnualIncome?.Trim()
            };

            var studentGuardian = new StudentGuardian
            {
                StudentId = student.Id,
                Guardian = guardian,
                Relationship = request.PrimaryGuardian.Relationship,
                IsPrimary = request.PrimaryGuardian.IsPrimary,
                IsEmergencyContact = request.PrimaryGuardian.IsEmergencyContact,
                IsAuthorizedToPickup = request.PrimaryGuardian.IsAuthorizedToPickup
            };

            student.StudentGuardians.Add(studentGuardian);
        }

        // Initial Enrollment
        string? yearName = null;
        string? progName = null;
        string? secName = null;

        if (request.InitialAcademicYearId.HasValue && request.InitialProgramId.HasValue)
        {
            var year = await _context.AcademicYears.FindAsync(new object[] { request.InitialAcademicYearId.Value }, cancellationToken);
            var prog = await _context.Programs.FindAsync(new object[] { request.InitialProgramId.Value }, cancellationToken);
            
            if (year != null && prog != null)
            {
                yearName = year.Name;
                progName = prog.Name;

                var enrollment = new Enrollment(
                    student.Id,
                    request.InitialAcademicYearId.Value,
                    request.InitialProgramId.Value,
                    DateOnly.FromDateTime(DateTime.UtcNow),
                    request.InitialSectionId,
                    request.InitialStreamId,
                    request.InitialBatchId,
                    null,
                    request.InitialRollNumber,
                    EnrollmentStatus.Active);

                student.Enrollments.Add(enrollment);

                if (request.InitialSectionId.HasValue)
                {
                    var sec = await _context.Sections.FindAsync(new object[] { request.InitialSectionId.Value }, cancellationToken);
                    secName = sec?.Name;
                }
            }
        }

        _context.Students.Add(student);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new StudentDto(
            student.Id,
            student.OrganizationId,
            student.CampusId,
            student.AdmissionNumber,
            student.FirstName,
            student.MiddleName,
            student.LastName,
            student.FullName,
            student.Gender,
            student.DateOfBirth,
            student.Email,
            student.PhoneNumber,
            student.EmergencyContactNumber,
            student.BloodGroup,
            student.Nationality,
            student.AvatarUrl,
            student.Status,
            request.InitialAcademicYearId,
            yearName,
            request.InitialProgramId,
            progName,
            request.InitialSectionId,
            secName,
            request.InitialRollNumber,
            student.CreatedAtUtc);

        return Result.Success(dto);
    }
}

public record UpdateStudentCommand(
    Guid StudentId,
    UpdateStudentRequest Request) : IRequest<Result<StudentDto>>;

public class UpdateStudentCommandHandler : IRequestHandler<UpdateStudentCommand, Result<StudentDto>>
{
    private readonly IApplicationDbContext _context;

    public UpdateStudentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<StudentDto>> Handle(UpdateStudentCommand command, CancellationToken cancellationToken)
    {
        var student = await _context.Students
            .Include(s => s.Enrollments)
            .FirstOrDefaultAsync(s => s.Id == command.StudentId, cancellationToken);

        if (student == null)
        {
            return Result.Failure<StudentDto>(Error.NotFound("Student.NotFound", "Student not found."));
        }

        var req = command.Request;
        student.FirstName = req.FirstName.Trim();
        student.MiddleName = req.MiddleName?.Trim();
        student.LastName = req.LastName.Trim();
        student.Gender = req.Gender;
        student.DateOfBirth = req.DateOfBirth;
        student.Email = req.Email?.Trim().ToLowerInvariant();
        student.PhoneNumber = req.PhoneNumber?.Trim();
        student.EmergencyContactNumber = req.EmergencyContactNumber?.Trim();
        student.BloodGroup = req.BloodGroup?.Trim();
        student.Nationality = req.Nationality?.Trim();
        student.Religion = req.Religion?.Trim();
        student.Category = req.Category?.Trim();
        student.AadharOrNationalId = req.AadharOrNationalId?.Trim();
        student.AvatarUrl = req.AvatarUrl?.Trim();

        await _context.SaveChangesAsync(cancellationToken);

        var activeEnrollment = student.Enrollments.FirstOrDefault(e => e.Status == EnrollmentStatus.Active);

        var dto = new StudentDto(
            student.Id,
            student.OrganizationId,
            student.CampusId,
            student.AdmissionNumber,
            student.FirstName,
            student.MiddleName,
            student.LastName,
            student.FullName,
            student.Gender,
            student.DateOfBirth,
            student.Email,
            student.PhoneNumber,
            student.EmergencyContactNumber,
            student.BloodGroup,
            student.Nationality,
            student.AvatarUrl,
            student.Status,
            activeEnrollment?.AcademicYearId,
            null,
            activeEnrollment?.ProgramId,
            null,
            activeEnrollment?.SectionId,
            null,
            activeEnrollment?.RollNumber,
            student.CreatedAtUtc);

        return Result.Success(dto);
    }
}

public record ChangeStudentStatusCommand(
    Guid StudentId,
    StudentStatus Status,
    string? Reason = null) : IRequest<Result>;

public class ChangeStudentStatusCommandHandler : IRequestHandler<ChangeStudentStatusCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public ChangeStudentStatusCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(ChangeStudentStatusCommand request, CancellationToken cancellationToken)
    {
        var student = await _context.Students.FindAsync(new object[] { request.StudentId }, cancellationToken);
        if (student == null)
        {
            return Result.Failure(Error.NotFound("Student.NotFound", "Student not found."));
        }

        student.Status = request.Status;
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

// --- Queries ---
public record GetStudentsQuery(
    Guid OrganizationId,
    Guid? CampusId = null,
    Guid? AcademicYearId = null,
    Guid? ProgramId = null,
    Guid? SectionId = null,
    StudentStatus? Status = null,
    string? SearchTerm = null,
    int PageNumber = 1,
    int PageSize = 20) : IRequest<Result<PagedList<StudentDto>>>;

public class GetStudentsQueryHandler : IRequestHandler<GetStudentsQuery, Result<PagedList<StudentDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetStudentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedList<StudentDto>>> Handle(GetStudentsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Students
            .AsNoTracking()
            .Where(s => s.OrganizationId == request.OrganizationId);

        if (request.CampusId.HasValue)
        {
            query = query.Where(s => s.CampusId == request.CampusId.Value);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(s => s.Status == request.Status.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.Trim().ToLower();
            query = query.Where(s =>
                s.AdmissionNumber.ToLower().Contains(term) ||
                s.FirstName.ToLower().Contains(term) ||
                s.LastName.ToLower().Contains(term) ||
                (s.Email != null && s.Email.ToLower().Contains(term)) ||
                (s.PhoneNumber != null && s.PhoneNumber.Contains(term)));
        }

        if (request.AcademicYearId.HasValue || request.ProgramId.HasValue || request.SectionId.HasValue)
        {
            query = query.Where(s => s.Enrollments.Any(e =>
                e.Status == EnrollmentStatus.Active &&
                (!request.AcademicYearId.HasValue || e.AcademicYearId == request.AcademicYearId.Value) &&
                (!request.ProgramId.HasValue || e.ProgramId == request.ProgramId.Value) &&
                (!request.SectionId.HasValue || e.SectionId == request.SectionId.Value)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(s => s.FirstName)
            .ThenBy(s => s.LastName)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(s => new
            {
                Student = s,
                ActiveEnrollment = s.Enrollments
                    .Where(e => e.Status == EnrollmentStatus.Active)
                    .OrderByDescending(e => e.EnrollmentDate)
                    .Select(e => new
                    {
                        e.AcademicYearId,
                        AcademicYearName = e.AcademicYear.Name,
                        e.ProgramId,
                        ProgramName = e.Program.Name,
                        e.SectionId,
                        SectionName = e.Section != null ? e.Section.Name : null,
                        e.RollNumber
                    })
                    .FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        var dtoList = items.Select(x => new StudentDto(
            x.Student.Id,
            x.Student.OrganizationId,
            x.Student.CampusId,
            x.Student.AdmissionNumber,
            x.Student.FirstName,
            x.Student.MiddleName,
            x.Student.LastName,
            x.Student.FullName,
            x.Student.Gender,
            x.Student.DateOfBirth,
            x.Student.Email,
            x.Student.PhoneNumber,
            x.Student.EmergencyContactNumber,
            x.Student.BloodGroup,
            x.Student.Nationality,
            x.Student.AvatarUrl,
            x.Student.Status,
            x.ActiveEnrollment?.AcademicYearId,
            x.ActiveEnrollment?.AcademicYearName,
            x.ActiveEnrollment?.ProgramId,
            x.ActiveEnrollment?.ProgramName,
            x.ActiveEnrollment?.SectionId,
            x.ActiveEnrollment?.SectionName,
            x.ActiveEnrollment?.RollNumber,
            x.Student.CreatedAtUtc)).ToList();

        var pagedList = new PagedList<StudentDto>(dtoList, totalCount, request.PageNumber, request.PageSize);
        return Result.Success(pagedList);
    }
}

public record GetStudentByIdQuery(Guid StudentId) : IRequest<Result<StudentDetailDto>>;

public class GetStudentByIdQueryHandler : IRequestHandler<GetStudentByIdQuery, Result<StudentDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public GetStudentByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<StudentDetailDto>> Handle(GetStudentByIdQuery request, CancellationToken cancellationToken)
    {
        var student = await _context.Students
            .AsNoTracking()
            .Include(s => s.Addresses)
            .Include(s => s.StudentGuardians)
                .ThenInclude(sg => sg.Guardian)
            .Include(s => s.Documents)
            .Include(s => s.Enrollments)
                .ThenInclude(e => e.AcademicYear)
            .Include(s => s.Enrollments)
                .ThenInclude(e => e.Program)
            .Include(s => s.Enrollments)
                .ThenInclude(e => e.Stream)
            .Include(s => s.Enrollments)
                .ThenInclude(e => e.Batch)
            .Include(s => s.Enrollments)
                .ThenInclude(e => e.Section)
            .Include(s => s.Enrollments)
                .ThenInclude(e => e.AcademicPeriod)
            .FirstOrDefaultAsync(s => s.Id == request.StudentId, cancellationToken);

        if (student == null)
        {
            return Result.Failure<StudentDetailDto>(Error.NotFound("Student.NotFound", "Student not found."));
        }

        var addresses = student.Addresses
            .Select(a => new StudentAddressDto(a.Id, a.StudentId, a.Type, a.AddressLine1, a.AddressLine2, a.City, a.State, a.Country, a.PostalCode))
            .ToList();

        var guardians = student.StudentGuardians
            .Select(sg => new StudentGuardianDto(
                sg.GuardianId,
                sg.Guardian.FullName,
                sg.Relationship,
                sg.Guardian.PhoneNumber,
                sg.Guardian.Email,
                sg.Guardian.Occupation,
                sg.IsPrimary,
                sg.IsEmergencyContact,
                sg.IsAuthorizedToPickup))
            .ToList();

        var docs = student.Documents
            .Select(d => new StudentDocumentDto(d.Id, d.StudentId, d.DocumentType, d.Title, d.DocumentUrl, d.FileSizeBytes, d.FileExtension, d.IsVerified, d.CreatedAtUtc))
            .ToList();

        var enrollments = student.Enrollments
            .OrderByDescending(e => e.EnrollmentDate)
            .Select(e => new EnrollmentDto(
                e.Id,
                e.StudentId,
                e.AcademicYearId,
                e.AcademicYear.Name,
                e.ProgramId,
                e.Program.Name,
                e.StreamId,
                e.Stream?.Name,
                e.BatchId,
                e.Batch?.Name,
                e.SectionId,
                e.Section?.Name,
                e.AcademicPeriodId,
                e.AcademicPeriod?.Name,
                e.RollNumber,
                e.EnrollmentDate,
                e.Status,
                e.CompletionDate,
                e.Remarks))
            .ToList();

        var detail = new StudentDetailDto(
            student.Id,
            student.OrganizationId,
            student.CampusId,
            student.AdmissionNumber,
            student.FirstName,
            student.MiddleName,
            student.LastName,
            student.FullName,
            student.Gender,
            student.DateOfBirth,
            student.Email,
            student.PhoneNumber,
            student.EmergencyContactNumber,
            student.BloodGroup,
            student.Nationality,
            student.Religion,
            student.Category,
            student.AadharOrNationalId,
            student.AvatarUrl,
            student.Status,
            student.CreatedAtUtc,
            addresses,
            guardians,
            docs,
            enrollments);

        return Result.Success(detail);
    }
}
