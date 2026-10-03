using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SchoolERP.Application.Common.Exceptions;
using SchoolERP.Contracts.Common;
using SchoolERP.Domain.Exceptions;

namespace SchoolERP.Api.Middleware;

public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionHandlerMiddleware(
        RequestDelegate next, 
        ILogger<GlobalExceptionHandlerMiddleware> logger,
        IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred during request execution. TraceId: {TraceId}", context.TraceIdentifier);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        var traceId = context.TraceIdentifier;

        HttpStatusCode statusCode;
        ApiResponse<object> response;

        switch (exception)
        {
            case ValidationException validationException:
                statusCode = HttpStatusCode.BadRequest;
                var errors = validationException.Errors
                    .SelectMany(kvp => kvp.Value.Select(msg => $"{kvp.Key}: {msg}"))
                    .ToList();
                response = ApiResponse<object>.Fail("Validation failed.", errors, traceId);
                break;

            case NotFoundException notFoundException:
                statusCode = HttpStatusCode.NotFound;
                response = ApiResponse<object>.Fail(notFoundException.Message, new List<string> { notFoundException.Message }, traceId);
                break;

            case UnauthorizedException unauthorizedException:
                statusCode = HttpStatusCode.Unauthorized;
                response = ApiResponse<object>.Fail(unauthorizedException.Message, new List<string> { unauthorizedException.Message }, traceId);
                break;

            case ForbiddenAccessException forbiddenException:
                statusCode = HttpStatusCode.Forbidden;
                response = ApiResponse<object>.Fail(forbiddenException.Message, new List<string> { forbiddenException.Message }, traceId);
                break;

            case ConflictException conflictException:
                statusCode = HttpStatusCode.Conflict;
                response = ApiResponse<object>.Fail(conflictException.Message, new List<string> { conflictException.Message }, traceId);
                break;

            case DomainException domainException:
                statusCode = HttpStatusCode.BadRequest;
                response = ApiResponse<object>.Fail(domainException.Message, new List<string> { $"[{domainException.Code}] {domainException.Message}" }, traceId);
                break;

            default:
                statusCode = HttpStatusCode.InternalServerError;
                var message = _env.IsDevelopment() 
                    ? $"{exception.Message} ({exception.GetType().Name})" 
                    : "An unexpected internal server error occurred.";
                var details = _env.IsDevelopment() && exception.StackTrace != null
                    ? new List<string> { exception.Message, exception.StackTrace }
                    : new List<string> { "Please contact system administrator if this persists." };

                response = ApiResponse<object>.Fail(message, details, traceId);
                break;
        }

        context.Response.StatusCode = (int)statusCode;

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
    }
}
