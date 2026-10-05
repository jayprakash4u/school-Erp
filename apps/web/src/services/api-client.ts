import { ApiResponse } from "@/types/common";

/**
 * Dynamically resolves the API Base URL:
 * - If running in the browser and NEXT_PUBLIC_API_URL contains localhost, replaces with window.location.hostname
 * - If NEXT_PUBLIC_API_URL is empty or not set in browser, defaults to "/api" (proxied by Next.js rewrites)
 * - If in SSR, uses backend internal URL
 */
export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  if (typeof window !== "undefined") {
    if (envUrl && envUrl.trim().length > 0) {
      if (envUrl.includes("localhost") || envUrl.includes("127.0.0.1")) {
        return envUrl.replace(/localhost|127\.0\.0\.1/, window.location.hostname);
      }
      return envUrl;
    }
    // Default to Next.js API rewrite proxy
    return "/api";
  }

  // Server-side rendering (SSR) fallback
  return (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.BACKEND_URL ||
    envUrl ||
    "http://127.0.0.1:5272/api"
  );
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public errors?: string[] | unknown,
    public traceId?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | (string | number)[] | undefined>;
  body?: unknown;
  timeout?: number;
}

/**
 * Serializes query parameters supporting primitives and arrays
 */
function buildQueryString(params?: Record<string, string | number | boolean | (string | number)[] | undefined>): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)));
    } else {
      searchParams.append(key, String(value));
    }
  });

  const str = searchParams.toString();
  return str ? `?${str}` : "";
}

/**
 * Centralized API request executor
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { params, headers, timeout = 30000, body, ...restOptions } = options;

  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const cleanEndpoint = endpoint.replace(/^\//, "");
  const url = `${baseUrl}/${cleanEndpoint}${buildQueryString(params)}`;

  // Retrieve token if in browser environment
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("erp_token") || sessionStorage.getItem("erp_token");
  }

  // Active School Tenant ID header if present
  let schoolId: string | null = null;
  if (typeof window !== "undefined") {
    schoolId = localStorage.getItem("erp_school_id");
  }

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const defaultHeaders: HeadersInit = {
    Accept: "application/json",
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(schoolId ? { "X-School-Id": schoolId } : {}),
    ...headers,
  };

  // Timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: defaultHeaders,
      body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
      signal: options.signal || controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle 401 Unauthorized globally
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("erp_token");
      sessionStorage.removeItem("erp_token");
      // Dispatch custom event for auth listeners
      window.dispatchEvent(new CustomEvent("erp:unauthorized"));
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data?.message || `Request failed with status ${response.status}`,
        data?.errors,
        data?.traceId
      );
    }

    return data as ApiResponse<T>;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if ((error as Error).name === "AbortError") {
      throw new ApiError(408, "Request timed out. Please try again.");
    }

    throw new ApiError(500, (error as Error).message || "An unexpected network error occurred");
  }
}

/**
 * Enterprise API Client with complete REST verbs and File operations
 */
export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),

  /**
   * File upload helper with multipart/form-data
   */
  upload: async <T>(endpoint: string, formData: FormData, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: formData,
    }),

  /**
   * Binary file download helper (PDF, Excel, CSV reports)
   */
  download: async (endpoint: string, filename?: string, options?: RequestOptions): Promise<void> => {
    const { params, headers } = options || {};
    const baseUrl = getApiBaseUrl().replace(/\/$/, "");
    const cleanEndpoint = endpoint.replace(/^\//, "");
    const url = `${baseUrl}/${cleanEndpoint}${buildQueryString(params)}`;

    let token: string | null = null;
    if (typeof window !== "undefined") {
      token = localStorage.getItem("erp_token");
    }

    const response = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to download file (${response.status})`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || "erp-download";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },
};
