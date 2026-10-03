import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

/**
 * Data formatters for currency, dates, numbers and file sizes
 */

export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(
  dateInput: string | Date | null | undefined,
  pattern: string = "MMM dd, yyyy"
): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
  if (!isValid(date)) return "—";
  return format(date, pattern);
}

export function formatDateTime(
  dateInput: string | Date | null | undefined,
  pattern: string = "MMM dd, yyyy • hh:mm a"
): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
  if (!isValid(date)) return "—";
  return format(date, pattern);
}

export function formatRelativeTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
  if (!isValid(date)) return "—";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatNumber(num: number, locale: string = "en-US"): string {
  return new Intl.NumberFormat(locale).format(num);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
