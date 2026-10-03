namespace SchoolERP.Application.Common.Exceptions;

public class UnauthorizedException : AppException
{
    public UnauthorizedException(string message = "You are not authenticated to perform this action.") 
        : base(message, "UNAUTHORIZED")
    {
    }
}
