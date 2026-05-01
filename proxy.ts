import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecrypt } from "jose";

// Matches next-auth v4's getDerivedEncryptionKey(secret, salt="")
// hkdf("sha256", secret, salt="", "NextAuth.js Generated Encryption Key", 32)
async function getDerivedKey(secret: string): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    "HKDF",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(0), // salt="" → empty byte array
      info: enc.encode("NextAuth.js Generated Encryption Key"),
    },
    keyMaterial,
    256
  );
  return new Uint8Array(bits);
}

async function getSessionToken(request: NextRequest): Promise<{ id: string; role: string } | null> {
  const cookieName = process.env.NODE_ENV === "production"
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";
  const rawToken = request.cookies.get(cookieName)?.value;
  if (!rawToken) return null;
  try {
    const key = await getDerivedKey(process.env.NEXTAUTH_SECRET!);
    const { payload } = await jwtDecrypt(rawToken, key, { clockTolerance: 15 });
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
