namespace SchoolERP.Application.Common.Exceptions;

public abstract class AppException : Exception
{
    public string Code { get; }

    protected AppException(string message, string code = "APPLICATION_ERROR") : base(message)
    {
        Code = code;
    }

    protected AppException(string message, Exception innerException, string code = "APPLICATION_ERROR") 
        : base(message, innerException)
    {
        Code = code;
    }
}
