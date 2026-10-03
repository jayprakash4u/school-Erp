using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Staff;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Staff;

namespace SchoolERP.Application.Staff;

// --- Commands ---
public record CreateStaffCommand(
    Guid OrganizationId,
    string EmployeeCode,
    string FirstName,
    string? MiddleName,
    string LastName,
    Gender Gender,
    DateOnly DateOfBirth,
    string Email,
    string? PhoneNumber = null,
    string? EmergencyContactNumber = null,
    string? BloodGroup = null,
    string? HighestQualification = null,
    int? ExperienceYears = null,
    StaffType StaffType = StaffType.Teaching,
    Guid? DepartmentId = null,
    Guid? DesignationId = null,
    EmploymentType EmploymentType = EmploymentType.FullTime,
    DateOnly? JoiningDate = null,
    string? AvatarUrl = null,
    Guid? CampusId = null,
    CreateTeacherProfileRequest? TeacherProfile = null) : IRequest<Result<StaffDto>>;

public class CreateStaffCommandValidator : AbstractValidator<CreateStaffCommand>
{
    public CreateStaffCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.EmployeeCode).NotEmpty().MaximumLength(50);
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.DateOfBirth).NotEmpty();
    }
}

public class CreateStaffCommandHandler : IRequestHandler<CreateStaffCommand, Result<StaffDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateStaffCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<StaffDto>> Handle(CreateStaffCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.Staff
            .AnyAsync(s => s.OrganizationId == request.OrganizationId && s.EmployeeCode == request.EmployeeCode.Trim(), cancellationToken);

        if (exists)
        {
            return Result.Failure<StaffDto>(Error.Conflict("Staff.DuplicateEmployeeCode", $"Staff with employee code '{request.EmployeeCode}' already exists."));
        }

        var joiningDate = request.JoiningDate ?? DateOnly.FromDateTime(DateTime.UtcNow);

        var staff = new SchoolERP.Domain.Entities.Staff.Staff(
            request.OrganizationId,
            request.EmployeeCode.Trim(),
            request.FirstName.Trim(),
            request.LastName.Trim(),
            request.Gender,
            request.DateOfBirth,
            request.Email.Trim().ToLowerInvariant(),
            request.StaffType,
            joiningDate,
            request.MiddleName?.Trim(),
            request.DepartmentId,
            request.DesignationId,
            request.EmploymentType,
            request.CampusId)
        {
            PhoneNumber = request.PhoneNumber?.Trim(),
            EmergencyContactNumber = request.EmergencyContactNumber?.Trim(),
            BloodGroup = request.BloodGroup?.Trim(),
            HighestQualification = request.HighestQualification?.Trim(),
            ExperienceYears = request.ExperienceYears,
            AvatarUrl = request.AvatarUrl?.Trim(),
            Status = StaffStatus.Active
        };

        // Attach TeacherProfile if teaching
        if (request.StaffType == StaffType.Teaching || request.TeacherProfile != null)
        {
            var tp = new TeacherProfile(
                staff.Id,
                request.TeacherProfile?.Specialization?.Trim(),
                request.TeacherProfile?.MaxWeeklyTeachingHours ?? 24,
                request.TeacherProfile?.IsEligibleForClassTeacher ?? true,
                request.TeacherProfile?.Notes);

            staff.TeacherProfile = tp;
        }

        _context.Staff.Add(staff);
        await _context.SaveChangesAsync(cancellationToken);

        string? deptName = null;
        if (request.DepartmentId.HasValue)
        {
            var dept = await _context.Departments.FindAsync(new object[] { request.DepartmentId.Value }, cancellationToken);
            deptName = dept?.Name;
        }

        string? desigTitle = null;
        if (request.DesignationId.HasValue)
        {
            var desig = await _context.Designations.FindAsync(new object[] { request.DesignationId.Value }, cancellationToken);
            desigTitle = desig?.Title;
        }

        var dto = new StaffDto(
            staff.Id,
            staff.OrganizationId,
            staff.CampusId,
            staff.EmployeeCode,
            staff.FirstName,
            staff.MiddleName,
            staff.LastName,
            staff.FullName,
            staff.Gender,
            staff.DateOfBirth,
            staff.Email,
            staff.PhoneNumber,
            staff.StaffType,
            staff.DepartmentId,
            deptName,
            staff.DesignationId,
            desigTitle,
            staff.EmploymentType,
            staff.JoiningDate,
            staff.Status,
            staff.AvatarUrl,
            staff.TeacherProfile != null,
            staff.CreatedAtUtc);

        return Result.Success(dto);
    }
}

public record UpdateStaffCommand(
    Guid StaffId,
    UpdateStaffRequest Request) : IRequest<Result<StaffDto>>;

public class UpdateStaffCommandHandler : IRequestHandler<UpdateStaffCommand, Result<StaffDto>>
{
    private readonly IApplicationDbContext _context;

    public UpdateStaffCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<StaffDto>> Handle(UpdateStaffCommand command, CancellationToken cancellationToken)
    {
        var staff = await _context.Staff
            .Include(s => s.Department)
            .Include(s => s.Designation)
            .Include(s => s.TeacherProfile)
            .FirstOrDefaultAsync(s => s.Id == command.StaffId, cancellationToken);

        if (staff == null)
        {
            return Result.Failure<StaffDto>(Error.NotFound("Staff.NotFound", "Staff member not found."));
        }

        var req = command.Request;
        staff.FirstName = req.FirstName.Trim();
        staff.MiddleName = req.MiddleName?.Trim();
        staff.LastName = req.LastName.Trim();
        staff.Gender = req.Gender;
        staff.DateOfBirth = req.DateOfBirth;
        staff.Email = req.Email.Trim().ToLowerInvariant();
        staff.PhoneNumber = req.PhoneNumber?.Trim();
        staff.EmergencyContactNumber = req.EmergencyContactNumber?.Trim();
        staff.BloodGroup = req.BloodGroup?.Trim();
        staff.HighestQualification = req.HighestQualification?.Trim();
        staff.ExperienceYears = req.ExperienceYears;
        staff.StaffType = req.StaffType;
        staff.DepartmentId = req.DepartmentId;
        staff.DesignationId = req.DesignationId;
        staff.EmploymentType = req.EmploymentType;
        staff.JoiningDate = req.JoiningDate;
        staff.AvatarUrl = req.AvatarUrl?.Trim();

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new StaffDto(
            staff.Id,
            staff.OrganizationId,
            staff.CampusId,
            staff.EmployeeCode,
            staff.FirstName,
            staff.MiddleName,
            staff.LastName,
            staff.FullName,
            staff.Gender,
            staff.DateOfBirth,
            staff.Email,
            staff.PhoneNumber,
            staff.StaffType,
            staff.DepartmentId,
            staff.Department?.Name,
            staff.DesignationId,
            staff.Designation?.Title,
            staff.EmploymentType,
            staff.JoiningDate,
            staff.Status,
            staff.AvatarUrl,
            staff.TeacherProfile != null,
            staff.CreatedAtUtc);

        return Result.Success(dto);
    }
}

public record ChangeStaffStatusCommand(
    Guid StaffId,
    StaffStatus Status,
    DateOnly? EffectiveDate = null,
    string? Reason = null) : IRequest<Result>;

public class ChangeStaffStatusCommandHandler : IRequestHandler<ChangeStaffStatusCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public ChangeStaffStatusCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(ChangeStaffStatusCommand request, CancellationToken cancellationToken)
    {
        var staff = await _context.Staff.FindAsync(new object[] { request.StaffId }, cancellationToken);
        if (staff == null)
        {
            return Result.Failure(Error.NotFound("Staff.NotFound", "Staff member not found."));
        }

        staff.Status = request.Status;
        if (request.Status == StaffStatus.Resigned || request.Status == StaffStatus.Terminated || request.Status == StaffStatus.Retired)
        {
            staff.ResignationDate = request.EffectiveDate ?? DateOnly.FromDateTime(DateTime.UtcNow);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

// --- Queries ---
public record GetStaffListQuery(
    Guid OrganizationId,
    Guid? CampusId = null,
    Guid? DepartmentId = null,
    Guid? DesignationId = null,
    StaffType? StaffType = null,
    StaffStatus? Status = null,
    string? SearchTerm = null,
    int PageNumber = 1,
    int PageSize = 20) : IRequest<Result<PagedList<StaffDto>>>;

public class GetStaffListQueryHandler : IRequestHandler<GetStaffListQuery, Result<PagedList<StaffDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetStaffListQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedList<StaffDto>>> Handle(GetStaffListQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Staff
            .AsNoTracking()
            .Where(s => s.OrganizationId == request.OrganizationId);

        if (request.CampusId.HasValue)
        {
            query = query.Where(s => s.CampusId == request.CampusId.Value);
        }

        if (request.DepartmentId.HasValue)
        {
            query = query.Where(s => s.DepartmentId == request.DepartmentId.Value);
        }

        if (request.DesignationId.HasValue)
        {
            query = query.Where(s => s.DesignationId == request.DesignationId.Value);
        }

        if (request.StaffType.HasValue)
        {
            query = query.Where(s => s.StaffType == request.StaffType.Value);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(s => s.Status == request.Status.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.Trim().ToLower();
            query = query.Where(s =>
                s.EmployeeCode.ToLower().Contains(term) ||
                s.FirstName.ToLower().Contains(term) ||
                s.LastName.ToLower().Contains(term) ||
                s.Email.ToLower().Contains(term) ||
                (s.PhoneNumber != null && s.PhoneNumber.Contains(term)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(s => s.FirstName)
            .ThenBy(s => s.LastName)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(s => new StaffDto(
                s.Id,
                s.OrganizationId,
                s.CampusId,
                s.EmployeeCode,
                s.FirstName,
                s.MiddleName,
                s.LastName,
                s.FullName,
                s.Gender,
                s.DateOfBirth,
                s.Email,
                s.PhoneNumber,
                s.StaffType,
                s.DepartmentId,
                s.Department != null ? s.Department.Name : null,
                s.DesignationId,
                s.Designation != null ? s.Designation.Title : null,
                s.EmploymentType,
                s.JoiningDate,
                s.Status,
                s.AvatarUrl,
                s.TeacherProfile != null,
                s.CreatedAtUtc))
            .ToListAsync(cancellationToken);

        var pagedList = new PagedList<StaffDto>(items, totalCount, request.PageNumber, request.PageSize);
        return Result.Success(pagedList);
    }
}

public record GetStaffByIdQuery(Guid StaffId) : IRequest<Result<StaffDetailDto>>;

public class GetStaffByIdQueryHandler : IRequestHandler<GetStaffByIdQuery, Result<StaffDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public GetStaffByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<StaffDetailDto>> Handle(GetStaffByIdQuery request, CancellationToken cancellationToken)
    {
        var staff = await _context.Staff
            .AsNoTracking()
            .Include(s => s.Department)
            .Include(s => s.Designation)
            .Include(s => s.TeacherProfile)
            .Include(s => s.Documents)
            .Include(s => s.TeacherAssignments)
                .ThenInclude(ta => ta.Subject)
            .Include(s => s.TeacherAssignments)
                .ThenInclude(ta => ta.Program)
            .Include(s => s.TeacherAssignments)
                .ThenInclude(ta => ta.Section)
            .Include(s => s.TeacherAssignments)
                .ThenInclude(ta => ta.AcademicYear)
            .Include(s => s.TeacherAssignments)
                .ThenInclude(ta => ta.AcademicPeriod)
            .FirstOrDefaultAsync(s => s.Id == request.StaffId, cancellationToken);

        if (staff == null)
        {
            return Result.Failure<StaffDetailDto>(Error.NotFound("Staff.NotFound", "Staff member not found."));
        }

        TeacherProfileDto? tpDto = null;
        if (staff.TeacherProfile != null)
        {
            tpDto = new TeacherProfileDto(
                staff.TeacherProfile.StaffId,
                staff.TeacherProfile.Specialization,
                staff.TeacherProfile.MaxWeeklyTeachingHours,
                staff.TeacherProfile.IsEligibleForClassTeacher,
                staff.TeacherProfile.Notes);
        }

        var assignments = staff.TeacherAssignments
            .Where(ta => ta.IsActive)
            .Select(ta => new TeacherAssignmentDto(
                ta.Id,
                ta.StaffId,
                staff.FullName,
                staff.EmployeeCode,
                ta.SubjectId,
                ta.Subject.Code,
                ta.Subject.Name,
                ta.ProgramId,
                ta.Program.Name,
                ta.SectionId,
                ta.Section?.Name,
                ta.AcademicYearId,
                ta.AcademicYear.Name,
                ta.AcademicPeriodId,
                ta.AcademicPeriod?.Name,
                ta.IsPrimaryTeacher,
                ta.AssignedDate,
                ta.IsActive,
                ta.Remarks))
            .ToList();

        var docs = staff.Documents
            .Select(d => new StaffDocumentDto(d.Id, d.StaffId, d.DocumentType, d.Title, d.DocumentUrl, d.FileSizeBytes, d.FileExtension, d.IsVerified, d.CreatedAtUtc))
            .ToList();

        var detail = new StaffDetailDto(
            staff.Id,
            staff.OrganizationId,
            staff.CampusId,
            staff.EmployeeCode,
            staff.FirstName,
            staff.MiddleName,
            staff.LastName,
            staff.FullName,
            staff.Gender,
            staff.DateOfBirth,
            staff.Email,
            staff.PhoneNumber,
            staff.EmergencyContactNumber,
            staff.BloodGroup,
            staff.HighestQualification,
            staff.ExperienceYears,
            staff.StaffType,
            staff.DepartmentId,
            staff.Department?.Name,
            staff.DesignationId,
            staff.Designation?.Title,
            staff.EmploymentType,
            staff.JoiningDate,
            staff.ResignationDate,
            staff.Status,
            staff.AvatarUrl,
            staff.UserId,
            tpDto,
            assignments,
            docs,
            staff.CreatedAtUtc);

        return Result.Success(detail);
    }
}
