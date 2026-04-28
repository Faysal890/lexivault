import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ForbiddenError, UnauthorizedError } from "./errors";

/**
 * Resolve the current user id from the NextAuth session, or throw UnauthorizedError.
 * Use in services and route handlers — never read session inside repositories.
 */
export async function requireUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError();
  return session.user.id;
}

export async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function requireAdminId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError();
  if (session.user.role !== "ADMIN") throw new ForbiddenError("Admin access required");
  return session.user.id;
}
