import { FieldValues, Path, UseFormSetError } from "react-hook-form";

export interface ServerValidationErrors {
  title?: string;
  status?: number;
  message?: string;
  errors?: Record<string, string[]> | string[];
}

/**
 * Maps .NET Core Web API / FluentValidation errors directly to React Hook Form fields.
 * Example API error format:
 * {
 *   "errors": {
 *     "Email": ["Email is already in use"],
 *     "SchoolName": ["School name is required"]
 *   }
 * }
 */
export function handleServerValidationErrors<T extends FieldValues>(
  errorData: unknown,
  setError: UseFormSetError<T>
): { hasMappedErrors: boolean; unmappedErrors: string[] } {
  const unmappedErrors: string[] = [];

  if (!errorData || typeof errorData !== "object") {
    return { hasMappedErrors: false, unmappedErrors: ["An unexpected error occurred."] };
  }

  const err = errorData as ServerValidationErrors;

  // Case 1: ASP.NET Core ProblemDetails dictionary { "FieldName": ["Error 1", "Error 2"] }
  if (err.errors && typeof err.errors === "object" && !Array.isArray(err.errors)) {
    let mappedAny = false;

    Object.entries(err.errors).forEach(([field, messages]) => {
      // Normalize camelCase / PascalCase field key
      const normalizedField = (field.charAt(0).toLowerCase() + field.slice(1)) as Path<T>;
      const primaryMessage = messages[0];

      if (primaryMessage) {
        try {
          setError(normalizedField, {
            type: "server",
            message: primaryMessage,
          });
          mappedAny = true;
        } catch {
          unmappedErrors.push(`${field}: ${primaryMessage}`);
        }
      }
    });

    return { hasMappedErrors: mappedAny, unmappedErrors };
  }

  // Case 2: Array of error strings
  if (Array.isArray(err.errors)) {
    return { hasMappedErrors: false, unmappedErrors: err.errors };
  }

  // Case 3: Top-level error message
  if (err.message) {
    return { hasMappedErrors: false, unmappedErrors: [err.message] };
  }

  return { hasMappedErrors: false, unmappedErrors: ["An unexpected server error occurred."] };
}
