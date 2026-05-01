import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/server/password";
import { userRepo } from "@/lib/server/repositories/user.repo";

// Per-email login attempt counter. Pure in-process — fine for single-instance hosting.
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_LOGIN_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function checkLoginAttempts(email: string): boolean {
  const now = Date.now();
  const rec = loginAttempts.get(email);
  if (!rec || rec.resetAt <= now) {
    loginAttempts.set(email, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return true;
  }
  if (rec.count >= MAX_LOGIN_ATTEMPTS) return false;
  rec.count += 1;
  return true;
}

function resetLoginAttempts(email: string) {
  loginAttempts.delete(email);
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.toLowerCase().trim();

        if (!checkLoginAttempts(email)) {
          throw new Error("TooManyAttempts");
        }

        const user = await userRepo.findByEmail(email);

        if (!user) return null;

        const isValid = await verifyPassword(credentials.password, user.passwordHash);
        if (!isValid) return null;

        if (!user.emailVerified) throw new Error("EmailNotVerified");

        resetLoginAttempts(email);
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
