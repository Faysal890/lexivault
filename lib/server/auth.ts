import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ForbiddenError, UnauthorizedError } from "./errors";
import { apiKeyService } from "./services/apiKey.service";

/**
 * If the request carries `Authorization: Bearer lx_...`, validate it and return
 * the resolved userId + role. Returns null when the header is absent so the
 * caller can fall through to the NextAuth session.
 *
 * A header that *is* present but malformed/invalid will throw — we never want
 * a bad bearer to silently degrade to a cookie-authenticated user.
 */
async function tryBearerAuth(): Promise<{ userId: string; role: string } | null> {
  const auth = (await headers()).get("authorization");
  if (!auth) return null;
  if (!auth.startsWith("Bearer ")) return null;
  const raw = auth.slice("Bearer ".length).trim();
  if (!raw.startsWith("lx_")) return null;
  return apiKeyService.authenticate(raw);
}

/**
 * Resolve the current user id from a Bearer API key OR the NextAuth session,
 * or throw UnauthorizedError. Bearer is checked first so an explicit API key
 * always wins over a stale cookie.
 */
export async function requireUserId(): Promise<string> {
  const bearer = await tryBearerAuth();
  if (bearer) return bearer.userId;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError();
  return session.user.id;
}

export async function getUserId(): Promise<string | null> {
  const bearer = await tryBearerAuth().catch(() => null);
  if (bearer) return bearer.userId;
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function requireAdminId(): Promise<string> {
  const bearer = await tryBearerAuth();
  if (bearer) {
    if (bearer.role !== "ADMIN") throw new ForbiddenError("Admin access required");
    return bearer.userId;
  }
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError();
  if (session.user.role !== "ADMIN") throw new ForbiddenError("Admin access required");
  return session.user.id;
}

/**
 * Force NextAuth session auth — rejects API keys.
 * Use on self-management routes (creating/revoking API keys) so a leaked key
 * cannot mint or destroy other keys.
 */
export async function requireSessionUserId(): Promise<string> {
  const auth = (await headers()).get("authorization");
  if (auth?.startsWith("Bearer ")) {
    throw new UnauthorizedError("This endpoint requires a logged-in session");
  }
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError();
  return session.user.id;
}
