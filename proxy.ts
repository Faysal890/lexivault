import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export const runtime = "edge";

async function getSessionToken(request: NextRequest): Promise<{ id: string; role: string } | null> {
  const cookieName = process.env.NODE_ENV === "production"
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";
  const token = request.cookies.get(cookieName)?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return { id: payload.id as string, role: payload.role as string };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const session = await getSessionToken(request);

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (request.nextUrl.pathname.startsWith("/admin") && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/words/:path*",
    "/quiz/:path*",
    "/stats/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/store/:path*",
  ],
};
