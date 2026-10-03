namespace SchoolERP.Contracts.Fees;

public enum FeeCategory
{
    Tuition = 1,
    Admission = 2,
    Examination = 3,
    Transport = 4,
    Hostel = 5,
    Library = 6,
    Laboratory = 7,
    Sports = 8,
    Miscellaneous = 9,
    CautionDeposit = 10
}

public enum FeeFrequency
{
    OneTime = 1,
    Monthly = 2,
    Quarterly = 3,
    Termly = 4,
    Annually = 5,
    Custom = 6
}

public enum DiscountType
{
    Percentage = 1,
    FixedAmount = 2
}

public enum InvoiceStatus
{
    Draft = 1,
    Issued = 2,
    PartiallyPaid = 3,
    Paid = 4,
    Overdue = 5,
    Cancelled = 6
}

public enum PaymentMethod
{
    Cash = 1,
    BankTransfer = 2,
    Cheque = 3,
    Online = 4,
    POS = 5,
    Card = 6,
    UPI_Wallet = 7
}

public enum PaymentStatus
{
    Pending = 1,
    Completed = 2,
    Failed = 3,
    Reversed = 4
}

public enum RefundStatus
{
    Pending = 1,
    Approved = 2,
    Rejected = 3,
    Processed = 4
}

public enum AdjustmentType
{
    Debit = 1,  // Increases student dues
    Credit = 2  // Decreases student dues
}

public enum LedgerEntryType
{
    InvoiceIssued = 1,
    PaymentReceived = 2,
    DiscountApplied = 3,
    WaiverApplied = 4,
    RefundIssued = 5,
    ManualAdjustment = 6
}
