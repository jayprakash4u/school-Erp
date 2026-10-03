using SchoolERP.Contracts.Settings;
using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Settings;

public class DocumentSequence : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public DocumentSequenceType SequenceType { get; set; }
    public string Prefix { get; set; } = string.Empty;
    public string? Suffix { get; set; }
    public int PaddingDigits { get; set; } = 5;
    public long CurrentSequence { get; set; } = 0;
    public SequenceResetFrequency ResetFrequency { get; set; } = SequenceResetFrequency.Never;
    public DateOnly? LastResetDate { get; set; }
    public string? FormatPattern { get; set; } // e.g. "{PREFIX}{YEAR}-{SEQ}{SUFFIX}"

    public DocumentSequence()
    {
        Id = Guid.NewGuid();
    }

    public DocumentSequence(
        Guid organizationId,
        DocumentSequenceType sequenceType,
        string prefix,
        int paddingDigits = 5,
        long currentSequence = 0,
        SequenceResetFrequency resetFrequency = SequenceResetFrequency.Never,
        string? suffix = null,
        string? formatPattern = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        SequenceType = sequenceType;
        Prefix = prefix;
        PaddingDigits = paddingDigits > 0 ? paddingDigits : 5;
        CurrentSequence = currentSequence;
        ResetFrequency = resetFrequency;
        Suffix = suffix;
        FormatPattern = formatPattern;
        LastResetDate = DateOnly.FromDateTime(DateTime.UtcNow);
    }

    public string GenerateNextNumber(DateOnly? date = null)
    {
        var today = date ?? DateOnly.FromDateTime(DateTime.UtcNow);

        CheckAndApplyReset(today);

        CurrentSequence++;
        return FormatSequenceNumber(CurrentSequence, today);
    }

    public string PreviewNextNumber(DateOnly? date = null)
    {
        var today = date ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var simulatedSeq = CurrentSequence;

        if (ShouldReset(today))
        {
            simulatedSeq = 1;
        }
        else
        {
            simulatedSeq++;
        }

        return FormatSequenceNumber(simulatedSeq, today);
    }

    private void CheckAndApplyReset(DateOnly today)
    {
        if (ShouldReset(today))
        {
            CurrentSequence = 0;
            LastResetDate = today;
        }
    }

    private bool ShouldReset(DateOnly today)
    {
        if (LastResetDate == null) return false;

        return ResetFrequency switch
        {
            SequenceResetFrequency.Yearly => LastResetDate.Value.Year != today.Year,
            SequenceResetFrequency.Monthly => LastResetDate.Value.Year != today.Year || LastResetDate.Value.Month != today.Month,
            _ => false
        };
    }

    private string FormatSequenceNumber(long seqNumber, DateOnly today)
    {
        var seqStr = seqNumber.ToString($"D{PaddingDigits}");

        if (string.IsNullOrWhiteSpace(FormatPattern))
        {
            return $"{Prefix}{seqStr}{Suffix}";
        }

        return FormatPattern
            .Replace("{PREFIX}", Prefix ?? "")
            .Replace("{SUFFIX}", Suffix ?? "")
            .Replace("{YEAR}", today.Year.ToString())
            .Replace("{YYYY}", today.Year.ToString())
            .Replace("{YY}", (today.Year % 100).ToString("D2"))
            .Replace("{MONTH}", today.Month.ToString("D2"))
            .Replace("{MM}", today.Month.ToString("D2"))
            .Replace("{SEQ}", seqStr);
    }
}
