import { z } from "zod";

/**
 * Standardized Zod Validators for School ERP
 */

export const emailValidator = z
  .string()
  .min(1, "Email address is required")
  .email("Please enter a valid email address");

export const passwordValidator = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const phoneValidator = z
  .string()
  .min(1, "Phone number is required")
  .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, "Please enter a valid phone number");

export const requiredString = (fieldName: string, min = 1, max = 255) =>
  z
    .string()
    .trim()
    .min(min, `${fieldName} must be at least ${min} character${min > 1 ? "s" : ""}`)
    .max(max, `${fieldName} cannot exceed ${max} characters`);

export const optionalString = (max = 255) =>
  z.string().trim().max(max, `Cannot exceed ${max} characters`).optional().or(z.literal(""));

export const positiveNumber = (fieldName: string) =>
  z.coerce
    .number()
    .positive(`${fieldName} must be greater than 0`);

export const nonNegativeNumber = (fieldName: string) =>
  z.coerce
    .number()
    .min(0, `${fieldName} cannot be negative`);

export const dateValidator = (fieldName: string) =>
  z.coerce.date({
    message: `Please enter a valid date for ${fieldName}`,
  });
