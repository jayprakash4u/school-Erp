namespace SchoolERP.Application.Common.Exceptions;

public class ForbiddenAccessException : AppException
{
    public ForbiddenAccessException(string message = "You do not have permission to access this resource.") 
        : base(message, "FORBIDDEN")
    {
    }
}
