using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;
using SchoolERP.Application.Common.Interfaces;

namespace SchoolERP.Application.Common.Behaviors;

public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;
    private readonly ICurrentUserService _currentUserService;

    public LoggingBehavior(
        ILogger<LoggingBehavior<TRequest, TResponse>> logger, 
        ICurrentUserService currentUserService)
    {
        _logger = logger;
        _currentUserService = currentUserService;
    }

    public async Task<TResponse> Handle(
        TRequest request, 
        RequestHandlerDelegate<TResponse> next, 
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        var userId = _currentUserService.UserId ?? "Anonymous";

        _logger.LogInformation(
            "Handling {RequestName} for User: {UserId}", 
            requestName, 
            userId);

        var stopwatch = Stopwatch.StartNew();

        try
        {
            var response = await next();
            stopwatch.Stop();

            if (stopwatch.ElapsedMilliseconds > 500)
            {
                _logger.LogWarning(
                    "Long Running Request: {RequestName} ({ElapsedMilliseconds} ms) for User: {UserId}", 
                    requestName, 
                    stopwatch.ElapsedMilliseconds, 
                    userId);
            }
            else
            {
                _logger.LogInformation(
                    "Handled {RequestName} in {ElapsedMilliseconds} ms for User: {UserId}", 
                    requestName, 
                    stopwatch.ElapsedMilliseconds, 
                    userId);
            }

            return response;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogError(
                ex, 
                "Error processing {RequestName} ({ElapsedMilliseconds} ms) for User: {UserId}", 
                requestName, 
                stopwatch.ElapsedMilliseconds, 
                userId);
            throw;
        }
    }
}
