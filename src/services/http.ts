/**
 * Single place where the app talks to "the server".
 *
 * Today every api/*.ts module resolves against local mock data through
 * `mockResponse`. When the Spring Boot backend is ready, set
 * VITE_API_BASE_URL and switch each api module's calls from `mockResponse`
 * to `request` — no component changes required.
 */

export const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env["VITE_API_BASE_URL"]
    : undefined) ?? "http://localhost:8080";

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const STORAGE_KEY = "buildcore.session";

const LATENCY_MS = 180;

export function mockResponse<T>(payload: T, latency = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(payload), latency));
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = getStoredToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Allow custom headers from init to override defaults
  if (init?.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((val, key) => {
        headers[key] = val;
      });
    } else if (Array.isArray(init.headers)) {
      for (const [key, val] of init.headers) {
        headers[key] = val;
      }
    } else {
      Object.assign(headers, init.headers);
    }
  }

  const url = path.startsWith("http://") || path.startsWith("https://")
    ? path
    : `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    ...init,
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      const pathname = window.location.pathname;
      if (pathname !== "/" && !pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    throw new Error("Unauthorized. Please sign in again.");
  }

  if (!res.ok) {
    let errorMsg = `${res.status} ${res.statusText}`;
    try {
      const errorJson = await res.json();
      if (errorJson?.message) {
        errorMsg = errorJson.message;
      } else if (typeof errorJson === "string") {
        errorMsg = errorJson;
      }
    } catch {
      // Use fallback errorMsg
    }
    throw new Error(errorMsg);
  }

  // For 204 No Content
  if (res.status === 204) {
    return null as T;
  }

  return (await res.json()) as T;
}
