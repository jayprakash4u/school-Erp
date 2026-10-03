using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Students;

namespace SchoolERP.Application.Students.Admissions;

public record CreateAdmissionCommand(
    Guid OrganizationId,
    Guid AcademicYearId,
    Guid ProgramId,
    string CandidateFirstName,
    string CandidateLastName,
    Gender CandidateGender,
    DateOnly CandidateDateOfBirth,
    Guid? StreamId = null,
    string? CandidateEmail = null,
    string? CandidatePhone = null,
    string? GuardianName = null,
    string? GuardianPhone = null,
    string? GuardianEmail = null,
    GuardianRelationship? GuardianRelationship = null,
    string? Remarks = null,
    Guid? CampusId = null) : IRequest<Result<AdmissionDto>>;

public class CreateAdmissionCommandValidator : AbstractValidator<CreateAdmissionCommand>
{
    public CreateAdmissionCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.AcademicYearId).NotEmpty();
        RuleFor(x => x.ProgramId).NotEmpty();
        RuleFor(x => x.CandidateFirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.CandidateLastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.CandidateDateOfBirth).NotEmpty();
    }
}

public class CreateAdmissionCommandHandler : IRequestHandler<CreateAdmissionCommand, Result<AdmissionDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateAdmissionCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AdmissionDto>> Handle(CreateAdmissionCommand request, CancellationToken cancellationToken)
    {
        var year = await _context.AcademicYears.FindAsync(new object[] { request.AcademicYearId }, cancellationToken);
        if (year == null)
        {
            return Result.Failure<AdmissionDto>(Error.NotFound("AcademicYear.NotFound", "Academic year not found."));
        }

        var program = await _context.Programs.FindAsync(new object[] { request.ProgramId }, cancellationToken);
        if (program == null)
        {
            return Result.Failure<AdmissionDto>(Error.NotFound("Program.NotFound", "Program/Grade not found."));
        }

        // Generate application number: APP-YEAR-RANDOM
        var yearCode = year.Code.Replace("-", "").Replace("/", "");
        var appCount = await _context.Admissions.CountAsync(a => a.OrganizationId == request.OrganizationId && a.AcademicYearId == request.AcademicYearId, cancellationToken);
        var appNumber = $"APP-{yearCode}-{(appCount + 1):D4}";

        var admission = new Admission(
            request.OrganizationId,
            appNumber,
            request.AcademicYearId,
            request.ProgramId,
            request.CandidateFirstName.Trim(),
            request.CandidateLastName.Trim(),
            request.CandidateGender,
            request.CandidateDateOfBirth,
            DateOnly.FromDateTime(DateTime.UtcNow),
            request.StreamId,
            request.CampusId)
        {
            CandidateEmail = request.CandidateEmail?.Trim().ToLowerInvariant(),
            CandidatePhone = request.CandidatePhone?.Trim(),
            GuardianName = request.GuardianName?.Trim(),
            GuardianPhone = request.GuardianPhone?.Trim(),
            GuardianEmail = request.GuardianEmail?.Trim().ToLowerInvariant(),
            GuardianRelationship = request.GuardianRelationship,
            Remarks = request.Remarks?.Trim(),
            Status = AdmissionStatus.Applied
        };

        _context.Admissions.Add(admission);
        await _context.SaveChangesAsync(cancellationToken);

        string? streamName = null;
        if (request.StreamId.HasValue)
        {
            var stream = await _context.Streams.FindAsync(new object[] { request.StreamId.Value }, cancellationToken);
            streamName = stream?.Name;
        }

        var dto = new AdmissionDto(
            admission.Id,
            admission.OrganizationId,
            admission.CampusId,
            admission.ApplicationNumber,
            admission.AdmissionNumber,
            admission.AcademicYearId,
            year.Name,
            admission.ProgramId,
            program.Name,
            admission.StreamId,
            streamName,
            admission.ApplicationDate,
            admission.AdmissionDate,
            admission.Status,
            admission.CandidateFirstName,
            admission.CandidateLastName,
            admission.CandidateGender,
            admission.CandidateDateOfBirth,
            admission.CandidateEmail,
            admission.CandidatePhone,
            admission.GuardianName,
            admission.GuardianPhone,
            admission.CreatedStudentId,
            admission.Remarks);

        return Result.Success(dto);
    }
}

public record ProcessAdmissionCommand(
    Guid AdmissionId,
    ProcessAdmissionRequest Request) : IRequest<Result<AdmissionDto>>;

public class ProcessAdmissionCommandHandler : IRequestHandler<ProcessAdmissionCommand, Result<AdmissionDto>>
{
    private readonly IApplicationDbContext _context;

    public ProcessAdmissionCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AdmissionDto>> Handle(ProcessAdmissionCommand command, CancellationToken cancellationToken)
    {
        var admission = await _context.Admissions
            .Include(a => a.AcademicYear)
            .Include(a => a.Program)
            .Include(a => a.Stream)
            .FirstOrDefaultAsync(a => a.Id == command.AdmissionId, cancellationToken);

        if (admission == null)
        {
            return Result.Failure<AdmissionDto>(Error.NotFound("Admission.NotFound", "Admission application not found."));
        }

        admission.Status = command.Request.Status;
        admission.Remarks = command.Request.Remarks ?? admission.Remarks;

        // If approved and admitted -> create student record and active enrollment automatically!
        if (command.Request.Status == AdmissionStatus.Admitted && !admission.CreatedStudentId.HasValue)
        {
            var admissionNumber = command.Request.AdmissionNumber ?? $"ADM-{admission.AcademicYear.Code.Replace("-", "")}-{(await _context.Students.CountAsync(s => s.OrganizationId == admission.OrganizationId, cancellationToken) + 1):D4}";
            admission.AdmissionNumber = admissionNumber;
            admission.AdmissionDate = DateOnly.FromDateTime(DateTime.UtcNow);

            var student = new Student(
                admission.OrganizationId,
                admissionNumber,
                admission.CandidateFirstName,
                admission.CandidateLastName,
                admission.CandidateGender,
                admission.CandidateDateOfBirth,
                null,
                admission.CampusId)
            {
                Email = admission.CandidateEmail,
                PhoneNumber = admission.CandidatePhone,
                Status = StudentStatus.Active
            };

            // Guardian if provided
            if (!string.IsNullOrWhiteSpace(admission.GuardianName))
            {
                var guardian = new Guardian(
                    admission.OrganizationId,
                    admission.GuardianName,
                    "",
                    admission.GuardianPhone,
                    admission.GuardianEmail,
                    admission.CampusId);

                var sg = new StudentGuardian
                {
                    StudentId = student.Id,
                    Guardian = guardian,
                    Relationship = admission.GuardianRelationship ?? GuardianRelationship.Guardian,
                    IsPrimary = true
                };

                student.StudentGuardians.Add(sg);
            }

            // Initial Enrollment
            var enrollment = new Enrollment(
                student.Id,
                admission.AcademicYearId,
                admission.ProgramId,
                DateOnly.FromDateTime(DateTime.UtcNow),
                command.Request.InitialSectionId,
                admission.StreamId,
                null,
                null,
                command.Request.RollNumber,
                EnrollmentStatus.Active);

            student.Enrollments.Add(enrollment);

            _context.Students.Add(student);
            admission.CreatedStudentId = student.Id;
        }

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new AdmissionDto(
            admission.Id,
            admission.OrganizationId,
            admission.CampusId,
            admission.ApplicationNumber,
            admission.AdmissionNumber,
            admission.AcademicYearId,
            admission.AcademicYear.Name,
            admission.ProgramId,
            admission.Program.Name,
            admission.StreamId,
            admission.Stream?.Name,
            admission.ApplicationDate,
            admission.AdmissionDate,
            admission.Status,
            admission.CandidateFirstName,
            admission.CandidateLastName,
            admission.CandidateGender,
            admission.CandidateDateOfBirth,
            admission.CandidateEmail,
            admission.CandidatePhone,
            admission.GuardianName,
            admission.GuardianPhone,
            admission.CreatedStudentId,
            admission.Remarks);

        return Result.Success(dto);
    }
}

public record GetAdmissionsQuery(
    Guid OrganizationId,
    Guid? CampusId = null,
    Guid? AcademicYearId = null,
    Guid? ProgramId = null,
    AdmissionStatus? Status = null,
    int PageNumber = 1,
    int PageSize = 20) : IRequest<Result<PagedList<AdmissionDto>>>;

public class GetAdmissionsQueryHandler : IRequestHandler<GetAdmissionsQuery, Result<PagedList<AdmissionDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetAdmissionsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedList<AdmissionDto>>> Handle(GetAdmissionsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Admissions
            .AsNoTracking()
            .Where(a => a.OrganizationId == request.OrganizationId);

        if (request.CampusId.HasValue)
        {
            query = query.Where(a => a.CampusId == request.CampusId.Value);
        }

        if (request.AcademicYearId.HasValue)
        {
            query = query.Where(a => a.AcademicYearId == request.AcademicYearId.Value);
        }

        if (request.ProgramId.HasValue)
        {
            query = query.Where(a => a.ProgramId == request.ProgramId.Value);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(a => a.Status == request.Status.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(a => a.ApplicationDate)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(a => new AdmissionDto(
                a.Id,
                a.OrganizationId,
                a.CampusId,
                a.ApplicationNumber,
                a.AdmissionNumber,
                a.AcademicYearId,
                a.AcademicYear.Name,
                a.ProgramId,
                a.Program.Name,
                a.StreamId,
                a.Stream != null ? a.Stream.Name : null,
                a.ApplicationDate,
                a.AdmissionDate,
                a.Status,
                a.CandidateFirstName,
                a.CandidateLastName,
                a.CandidateGender,
                a.CandidateDateOfBirth,
                a.CandidateEmail,
                a.CandidatePhone,
                a.GuardianName,
                a.GuardianPhone,
                a.CreatedStudentId,
                a.Remarks))
            .ToListAsync(cancellationToken);

        var pagedList = new PagedList<AdmissionDto>(items, totalCount, request.PageNumber, request.PageSize);
        return Result.Success(pagedList);
    }
}
