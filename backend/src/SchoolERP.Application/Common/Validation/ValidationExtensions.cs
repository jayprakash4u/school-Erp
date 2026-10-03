using System.Text.RegularExpressions;
using FluentValidation;

namespace SchoolERP.Application.Common.Validation;

public static class ValidationExtensions
{
    private static readonly Regex PhoneRegex = new(@"^\+?[0-9\s\-()]{7,20}$", RegexOptions.Compiled);
    private static readonly Regex CodeRegex = new(@"^[A-Z0-9_\-\.\/]+$", RegexOptions.Compiled | RegexOptions.IgnoreCase);

    /// <summary>
    /// Validates that a string matches a standard international or local phone number format.
    /// </summary>
    public static IRuleBuilderOptions<T, string?> MustBeValidPhoneNumber<T>(this IRuleBuilder<T, string?> ruleBuilder)
    {
        return ruleBuilder
            .Must(phone => string.IsNullOrWhiteSpace(phone) || PhoneRegex.IsMatch(phone))
            .WithMessage("'{PropertyName}' must be a valid phone number (7-20 digits with optional + country code).");
    }

    /// <summary>
    /// Validates that a code (e.g. Org Code, Program Code, Item Code) contains only alphanumeric characters, dashes, underscores, dots, or slashes.
    /// </summary>
    public static IRuleBuilderOptions<T, string> MustBeValidCode<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty()
            .Must(code => CodeRegex.IsMatch(code))
            .WithMessage("'{PropertyName}' can only contain alphanumeric characters, underscores, hyphens, dots, and slashes.");
    }

    /// <summary>
    /// Validates that a financial or quantitative decimal is greater than zero and has at most 2 decimal places.
    /// </summary>
    public static IRuleBuilderOptions<T, decimal> MustBeValidCurrencyAmount<T>(this IRuleBuilder<T, decimal> ruleBuilder)
    {
        return ruleBuilder
            .GreaterThan(0)
            .Must(amount => decimal.Round(amount, 2) == amount)
            .WithMessage("'{PropertyName}' must be greater than zero and have at most 2 decimal places.");
    }

    /// <summary>
    /// Validates that an optional financial decimal is non-negative and has at most 2 decimal places.
    /// </summary>
    public static IRuleBuilderOptions<T, decimal> MustBeNonNegativeCurrencyAmount<T>(this IRuleBuilder<T, decimal> ruleBuilder)
    {
        return ruleBuilder
            .GreaterThanOrEqualTo(0)
            .Must(amount => decimal.Round(amount, 2) == amount)
            .WithMessage("'{PropertyName}' must be non-negative and have at most 2 decimal places.");
    }
}
