using FluentValidation;
using MediatR;
using SchoolERP.Application.Common.Behaviors;
using SchoolERP.Application.Common.Models;
using SchoolERP.Application.Common.Validation;
using AppValidationException = SchoolERP.Application.Common.Exceptions.ValidationException;
using Xunit;

namespace SchoolERP.UnitTests.Common;

public class ValidationPipelineTests
{
    public record SampleCommand(string Code, string? Phone, decimal Amount) : IRequest<Result<string>>;

    public class SampleCommandValidator : AbstractValidator<SampleCommand>
    {
        public SampleCommandValidator()
        {
            RuleFor(x => x.Code).MustBeValidCode().MaximumLength(20);
            RuleFor(x => x.Phone).MustBeValidPhoneNumber();
            RuleFor(x => x.Amount).MustBeValidCurrencyAmount();
        }
    }

    [Fact]
    public async Task ValidationBehavior_WhenRequestIsValid_ShouldCallNextDelegate()
    {
        // 1. Arrange
        var validator = new SampleCommandValidator();
        var behavior = new ValidationBehavior<SampleCommand, Result<string>>(new[] { validator });
        var validCommand = new SampleCommand("STU-100", "+977-9801234567", 1500.50m);

        // 2. Act
        var result = await behavior.Handle(
            validCommand,
            (ct) => Task.FromResult(Result.Success("ProcessedSuccessfully")),
            CancellationToken.None);

        // 3. Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("ProcessedSuccessfully", result.Value);
    }

    [Fact]
    public async Task ValidationBehavior_WhenRequestIsInvalid_ShouldThrowValidationExceptionWithFieldErrors()
    {
        // 1. Arrange
        var validator = new SampleCommandValidator();
        var behavior = new ValidationBehavior<SampleCommand, Result<string>>(new[] { validator });
        var invalidCommand = new SampleCommand("INVALID CODE WITH SPACES!", "not-a-phone", -500.1234m);

        // 2. Act & Assert
        var ex = await Assert.ThrowsAsync<AppValidationException>(() =>
            behavior.Handle(
                invalidCommand,
                (ct) => Task.FromResult(Result.Success("ShouldNotReach")),
                CancellationToken.None));

        Assert.NotNull(ex.Errors);
        Assert.True(ex.Errors.ContainsKey("Code"));
        Assert.True(ex.Errors.ContainsKey("Phone"));
        Assert.True(ex.Errors.ContainsKey("Amount"));
    }

    [Theory]
    [InlineData("Valid-Code_01", true)]
    [InlineData("INV/2026/001", true)]
    [InlineData("Invalid Code With Spaces", false)]
    [InlineData("Code@With#Special!", false)]
    public void MustBeValidCode_ShouldValidateAppropriately(string code, bool expectedValid)
    {
        var validator = new InlineCodeValidator();
        var result = validator.Validate(code);
        Assert.Equal(expectedValid, result.IsValid);
    }

    private class InlineCodeValidator : AbstractValidator<string>
    {
        public InlineCodeValidator()
        {
            RuleFor(x => x).MustBeValidCode();
        }
    }
}
