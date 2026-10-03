using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Fees;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Fees;

namespace SchoolERP.Application.Fees;

public record AssignStudentFeeCommand(
    Guid OrganizationId,
    Guid StudentId,
    Guid AcademicYearId,
    Guid ProgramId,
    Guid FeeStructureId,
    Guid? DiscountPolicyId = null,
    decimal? CustomDiscountAmount = null,
    string? Remarks = null,
    Guid? CampusId = null) : IRequest<Result<StudentFeeDto>>;

public class AssignStudentFeeCommandValidator : AbstractValidator<AssignStudentFeeCommand>
{
    public AssignStudentFeeCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.StudentId).NotEmpty();
        RuleFor(x => x.AcademicYearId).NotEmpty();
        RuleFor(x => x.ProgramId).NotEmpty();
        RuleFor(x => x.FeeStructureId).NotEmpty();
    }
}

public class AssignStudentFeeCommandHandler : IRequestHandler<AssignStudentFeeCommand, Result<StudentFeeDto>>
{
    private readonly IApplicationDbContext _context;

    public AssignStudentFeeCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<StudentFeeDto>> Handle(AssignStudentFeeCommand request, CancellationToken cancellationToken)
    {
        var student = await _context.Students.FindAsync(new object[] { request.StudentId }, cancellationToken);
        if (student == null)
        {
            return Result.Failure<StudentFeeDto>(Error.NotFound("Student.NotFound", "Student not found."));
        }

        var year = await _context.AcademicYears.FindAsync(new object[] { request.AcademicYearId }, cancellationToken);
        if (year == null)
        {
            return Result.Failure<StudentFeeDto>(Error.NotFound("AcademicYear.NotFound", "Academic year not found."));
        }

        var program = await _context.Programs.FindAsync(new object[] { request.ProgramId }, cancellationToken);
        if (program == null)
        {
            return Result.Failure<StudentFeeDto>(Error.NotFound("Program.NotFound", "Program/Grade not found."));
        }

        var feeStructure = await _context.FeeStructures
            .Include(f => f.Items)
                .ThenInclude(i => i.FeeHead)
            .FirstOrDefaultAsync(f => f.Id == request.FeeStructureId, cancellationToken);

        if (feeStructure == null)
        {
            return Result.Failure<StudentFeeDto>(Error.NotFound("FeeStructure.NotFound", "Fee structure not found."));
        }

        DiscountPolicy? discountPolicy = null;
        if (request.DiscountPolicyId.HasValue)
        {
            discountPolicy = await _context.DiscountPolicies.FindAsync(new object[] { request.DiscountPolicyId.Value }, cancellationToken);
        }

        // Find or create StudentFee
        var existingStudentFee = await _context.StudentFees
            .Include(s => s.Items)
            .FirstOrDefaultAsync(s => s.StudentId == request.StudentId && s.AcademicYearId == request.AcademicYearId, cancellationToken);

        var customDiscount = request.CustomDiscountAmount ?? 0;

        if (existingStudentFee != null)
        {
            existingStudentFee.FeeStructureId = request.FeeStructureId;
            existingStudentFee.DiscountPolicyId = request.DiscountPolicyId;
            existingStudentFee.CustomDiscountAmount = customDiscount;
            existingStudentFee.Remarks = request.Remarks;
            _context.StudentFeeItems.RemoveRange(existingStudentFee.Items);
            existingStudentFee.Items.Clear();
        }
        else
        {
            existingStudentFee = new StudentFee(
                request.OrganizationId,
                request.StudentId,
                request.AcademicYearId,
                request.ProgramId,
                request.FeeStructureId,
                request.DiscountPolicyId,
                customDiscount,
                request.Remarks,
                request.CampusId);

            _context.StudentFees.Add(existingStudentFee);
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var totalFeeAmount = feeStructure.Items.Sum(i => i.Amount);
        decimal remainingFixedDiscount = customDiscount;
        if (discountPolicy != null && discountPolicy.Type == DiscountType.FixedAmount)
        {
            remainingFixedDiscount += discountPolicy.Value;
        }

        foreach (var structItem in feeStructure.Items)
        {
            decimal itemDiscount = 0;
            if (discountPolicy != null && discountPolicy.Type == DiscountType.Percentage)
            {
                // Apply percentage discount on this item
                itemDiscount = Math.Round((structItem.Amount * discountPolicy.Value) / 100m, 2);
            }
            else if (remainingFixedDiscount > 0)
            {
                var alloc = Math.Min(structItem.Amount, remainingFixedDiscount);
                itemDiscount = alloc;
                remainingFixedDiscount -= alloc;
            }

            var dueDate = structItem.DueDate ?? today.AddMonths(1);
            var item = new StudentFeeItem(
                existingStudentFee.Id,
                structItem.FeeHeadId,
                structItem.Amount,
                itemDiscount,
                dueDate);

            existingStudentFee.Items.Add(item);
        }

        await _context.SaveChangesAsync(cancellationToken);

        var itemDtos = existingStudentFee.Items.Select(i =>
        {
            var fh = feeStructure.Items.First(si => si.FeeHeadId == i.FeeHeadId).FeeHead;
            return new StudentFeeItemDto(
                i.Id,
                i.FeeHeadId,
                fh.Name,
                i.OriginalAmount,
                i.DiscountAmount,
                i.NetAmount,
                i.DueDate);
        }).ToList();

        var dto = new StudentFeeDto(
            existingStudentFee.Id,
            existingStudentFee.OrganizationId,
            existingStudentFee.CampusId,
            student.Id,
            $"{student.FirstName} {student.LastName}",
            student.AdmissionNumber,
            year.Id,
            year.Name,
            program.Id,
            program.Name,
            feeStructure.Id,
            feeStructure.Name,
            discountPolicy?.Id,
            discountPolicy?.Name,
            existingStudentFee.TotalOriginalAmount,
            existingStudentFee.TotalDiscountAmount,
            existingStudentFee.TotalNetAmount,
            existingStudentFee.Remarks,
            itemDtos);

        return Result.Success(dto);
    }
}

public record BatchAssignStudentFeesCommand(
    Guid OrganizationId,
    Guid AcademicYearId,
    Guid ProgramId,
    Guid FeeStructureId,
    Guid? SectionId = null,
    Guid? CampusId = null) : IRequest<Result<int>>;

public class BatchAssignStudentFeesCommandHandler : IRequestHandler<BatchAssignStudentFeesCommand, Result<int>>
{
    private readonly IApplicationDbContext _context;
    private readonly ISender _sender;

    public BatchAssignStudentFeesCommandHandler(IApplicationDbContext context, ISender sender)
    {
        _context = context;
        _sender = sender;
    }

    public async Task<Result<int>> Handle(BatchAssignStudentFeesCommand request, CancellationToken cancellationToken)
    {
        var enrollmentsQuery = _context.Enrollments
            .Where(en => en.AcademicYearId == request.AcademicYearId &&
                         en.ProgramId == request.ProgramId &&
                         en.Status == EnrollmentStatus.Active);

        if (request.SectionId.HasValue)
        {
            enrollmentsQuery = enrollmentsQuery.Where(en => en.SectionId == request.SectionId.Value);
        }

        var studentIds = await enrollmentsQuery.Select(en => en.StudentId).Distinct().ToListAsync(cancellationToken);
        int assignedCount = 0;

        foreach (var studentId in studentIds)
        {
            var cmd = new AssignStudentFeeCommand(
                request.OrganizationId,
                studentId,
                request.AcademicYearId,
                request.ProgramId,
                request.FeeStructureId,
                CampusId: request.CampusId);

            var res = await _sender.Send(cmd, cancellationToken);
            if (res.IsSuccess)
            {
                assignedCount++;
            }
        }

        return Result.Success(assignedCount);
    }
}

public record GetStudentFeeQuery(Guid StudentId, Guid? AcademicYearId = null) : IRequest<Result<StudentFeeDto>>;

public class GetStudentFeeQueryHandler : IRequestHandler<GetStudentFeeQuery, Result<StudentFeeDto>>
{
    private readonly IApplicationDbContext _context;

    public GetStudentFeeQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<StudentFeeDto>> Handle(GetStudentFeeQuery request, CancellationToken cancellationToken)
    {
        var query = _context.StudentFees
            .AsNoTracking()
            .Include(s => s.Student)
            .Include(s => s.AcademicYear)
            .Include(s => s.Program)
            .Include(s => s.FeeStructure)
            .Include(s => s.DiscountPolicy)
            .Include(s => s.Items)
                .ThenInclude(i => i.FeeHead)
            .Where(s => s.StudentId == request.StudentId);

        if (request.AcademicYearId.HasValue)
        {
            query = query.Where(s => s.AcademicYearId == request.AcademicYearId.Value);
        }

        var studentFee = await query
            .OrderByDescending(s => s.CreatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);

        if (studentFee == null)
        {
            return Result.Failure<StudentFeeDto>(Error.NotFound("StudentFee.NotFound", "Fee plan not assigned to this student for the specified academic year."));
        }

        var itemDtos = studentFee.Items.Select(i => new StudentFeeItemDto(
            i.Id,
            i.FeeHeadId,
            i.FeeHead.Name,
            i.OriginalAmount,
            i.DiscountAmount,
            i.NetAmount,
            i.DueDate)).ToList();

        var dto = new StudentFeeDto(
            studentFee.Id,
            studentFee.OrganizationId,
            studentFee.CampusId,
            studentFee.StudentId,
            $"{studentFee.Student.FirstName} {studentFee.Student.LastName}",
            studentFee.Student.AdmissionNumber,
            studentFee.AcademicYearId,
            studentFee.AcademicYear.Name,
            studentFee.ProgramId,
            studentFee.Program.Name,
            studentFee.FeeStructureId,
            studentFee.FeeStructure.Name,
            studentFee.DiscountPolicyId,
            studentFee.DiscountPolicy?.Name,
            studentFee.TotalOriginalAmount,
            studentFee.TotalDiscountAmount,
            studentFee.TotalNetAmount,
            studentFee.Remarks,
            itemDtos);

        return Result.Success(dto);
    }
}
