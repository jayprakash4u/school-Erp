using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Identity.Auth.Commands.ForgotPassword;
using SchoolERP.Application.Identity.Auth.Commands.Login;
using SchoolERP.Application.Identity.Auth.Commands.Logout;
using SchoolERP.Application.Identity.Auth.Commands.RefreshToken;
using SchoolERP.Application.Identity.Auth.Commands.ResetPassword;
using SchoolERP.Application.Identity.Auth.Queries.GetCurrentUser;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Identity;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/[controller]")]
public class AuthController : ApiControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await Mediator.Send(new LoginCommand(request.Email, request.Password, ipAddress, userAgent));
        return HandleResult(result, "Login successful.");
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var result = await Mediator.Send(new RefreshTokenCommand(request.AccessToken, request.RefreshToken, ipAddress));
        return HandleResult(result, "Token refreshed successfully.");
    }

    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest? request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var result = await Mediator.Send(new LogoutCommand(request?.RefreshToken, ipAddress));
        return HandleResult(result, "Logged out successfully.");
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var result = await Mediator.Send(new ForgotPasswordCommand(request.Email, ipAddress));
        return HandleResult(result, "Password reset instruction generated.");
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var result = await Mediator.Send(new ResetPasswordCommand(request.Email, request.Token, request.NewPassword, ipAddress));
        return HandleResult(result, "Password has been reset successfully. You can now login with your new password.");
    }

    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserProfileResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCurrentUser()
    {
        var result = await Mediator.Send(new GetCurrentUserQuery());
        return HandleResult(result, "User profile retrieved.");
    }
}
