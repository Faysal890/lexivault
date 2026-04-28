/**
 * Typed fetch wrapper for the /api/v1 surface.
 *
 * - Adds JSON headers and same-origin cookies (NextAuth session) automatically.
 * - Unwraps the { data } / { error } envelope.
 * - Throws ApiClientError on non-2xx so callers can `try/catch` once.
 */
export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const API_BASE = "/api/v1";

interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(API_BASE + path, typeof window !== "undefined" ? window.location.origin : "http://localhost");
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }
  return typeof window !== "undefined" ? url.pathname + url.search : url.toString();
}

async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const init: RequestInit = {
    method,
    headers: opts.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    credentials: "same-origin",
    signal: opts.signal,
  };

  const res = await fetch(buildUrl(path, opts.query), init);

  if (res.status === 204) return undefined as T;

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = (json as { error?: { code?: string; message?: string; details?: unknown } }).error;
    throw new ApiClientError(
      res.status,
      err?.code ?? "UNKNOWN",
      err?.message ?? `Request failed with ${res.status}`,
      err?.details
    );
  }

  return (json as { data: T }).data;
}

export const apiClient = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>("GET", path, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>("POST", path, { ...opts, body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>("PUT", path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>("PATCH", path, { ...opts, body }),
  delete: <T = void>(path: string, opts?: RequestOptions) => request<T>("DELETE", path, opts),
};
