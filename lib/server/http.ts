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
          new ValidationError(err.errors[0]?.message ?? "Invalid input", err.flatten())
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
