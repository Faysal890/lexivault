import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, ValidationError } from "./errors";

export interface ApiSuccess<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiFailure {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function ok<T>(data: T, meta?: Record<string, unknown>, init?: { status?: number }) {
  const body: ApiSuccess<T> = meta ? { data, meta } : { data };
  return NextResponse.json(body, { status: init?.status ?? 200 });
}

export function created<T>(data: T, meta?: Record<string, unknown>) {
  return ok(data, meta, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function fail(error: AppError): NextResponse<ApiFailure> {
  const body: ApiFailure = {
    error: {
      code: error.code,
      message: error.message,
      ...(error.details !== undefined ? { details: error.details } : {}),
    },
  };
  return NextResponse.json(body, { status: error.status });
}

/**
 * Wrap a route handler so any thrown AppError or ZodError becomes a JSON envelope.
 * Anything else becomes a 500 with a generic message (logged to console).
 */
export function handle<TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<NextResponse>
): (...args: TArgs) => Promise<NextResponse> {
  return async (...args: TArgs) => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof AppError) return fail(err);
      if (err instanceof ZodError) {
        return fail(
          new ValidationError(err.issues[0]?.message ?? "Invalid input", err.flatten())
        );
      }
      console.error("[api]", err);
      return fail(
        new AppError("INTERNAL_ERROR", 500, "Internal server error")
      );
    }
  };
}

export async function parseJson<T>(req: Request, parser: (raw: unknown) => T): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    raw = {};
  }
  return parser(raw);
}

/**
 * CORS headers for /api/v1/* — exposes the API to mobile apps and browser
 * extensions.
 *
 * `Access-Control-Allow-Origin: *` is intentional and is safe ONLY because we
 * never send `Access-Control-Allow-Credentials: true`. That combination would
 * let any website ride a logged-in user's NextAuth cookie. External clients
 * authenticate with `Authorization: Bearer lx_...` instead, which the browser
 * will not auto-attach cross-origin.
 *
 * Do not add `Allow-Credentials: true` here.
 */
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
};

function applyCors(res: NextResponse): NextResponse {
  for (const [k, v] of Object.entries(CORS_HEADERS)) {
    res.headers.set(k, v);
  }
  return res;
}

export function corsPreflight(): NextResponse {
  return applyCors(new NextResponse(null, { status: 204 }));
}

/**
 * Same as `handle()` but additionally:
 *  - responds 204 to OPTIONS preflight requests
 *  - appends CORS headers to every response
 */
export function corsHandle<TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<NextResponse>
): (...args: TArgs) => Promise<NextResponse> {
  const wrapped = handle(fn);
  return async (...args: TArgs) => {
    const req = args[0] as Request | undefined;
    if (req && typeof req === "object" && "method" in req && req.method === "OPTIONS") {
      return corsPreflight();
    }
    const res = await wrapped(...args);
    return applyCors(res);
  };
}

/**
 * Standalone OPTIONS handler — export from any /api/v1/* route to unlock CORS
 * preflight without going through `corsHandle` (e.g. routes that intentionally
 * use plain `handle`).
 */
export const corsOptions = () => corsPreflight();
