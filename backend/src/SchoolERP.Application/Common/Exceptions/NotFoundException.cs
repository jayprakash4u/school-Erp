namespace SchoolERP.Application.Common.Exceptions;

public class NotFoundException : AppException
{
    public NotFoundException(string message) 
        : base(message, "NOT_FOUND")
    {
    }

    public NotFoundException(string entityName, object key) 
        : base($"Entity \"{entityName}\" with key ({key}) was not found.", "NOT_FOUND")
    {
    }
}
