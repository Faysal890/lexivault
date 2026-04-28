import bcrypt from "bcryptjs";
import crypto from "crypto";
import { BadRequestError, ConflictError } from "../errors";
import { userRepo } from "../repositories/user.repo";
import { emailVerificationTokenRepo, passwordResetTokenRepo } from "../repositories/token.repo";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";
import type {
  ForgotPasswordInput,
  RegisterInput,
  ResendVerificationInput,
  ResetPasswordInput,
  VerifyEmailQuery,
} from "../dto/auth";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function newToken() {
  const raw = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
}

export const authService = {
  async register(input: RegisterInput): Promise<{ message: string; devVerifyUrl?: string }> {
    const existing = await userRepo.findByEmail(input.email);
    if (existing) throw new ConflictError("Email already in use");

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await userRepo.createWithStreak({
      name: input.name,
      email: input.email,
      passwordHash,
      nativeLanguage: input.nativeLanguage,
    });

    const { raw, hash } = newToken();
    await emailVerificationTokenRepo.create({
      userId: user.id,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + DAY_MS),
    });

    const verificationUrl = `${appUrl()}/verify-email?token=${raw}`;
    console.log(`[verify-email] ${user.email} → ${verificationUrl}`);
    try {
      await sendVerificationEmail(user.email, verificationUrl, user.name);
    } catch (err) {
      console.error("[verify-email] send failed:", err);
    }

    return {
      message: "Account created! Please check your email to verify your account.",
      ...(process.env.NODE_ENV === "development" ? { devVerifyUrl: verificationUrl } : {}),
    };
  },

  /**
   * Forgot-password is intentionally generic: we always return the same response
   * regardless of whether the email exists, to avoid leaking account existence.
   */
  async forgotPassword(input: ForgotPasswordInput): Promise<{ message: string }> {
    const generic = { message: "If that email is registered, you'll receive a reset link shortly." };
    const user = await userRepo.findByEmail(input.email);
    if (!user) return generic;

    await passwordResetTokenRepo.invalidateActiveForUser(user.id);
    const { raw, hash } = newToken();
    await passwordResetTokenRepo.create({
      userId: user.id,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + HOUR_MS),
    });

    const resetUrl = `${appUrl()}/reset-password?token=${raw}`;
    try {
      await sendPasswordResetEmail(user.email, resetUrl, user.name);
    } catch (err) {
      console.error("[forgot-password] send failed:", err);
    }
    return generic;
  },

  async resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    const tokenHash = crypto.createHash("sha256").update(input.token).digest("hex");
    const record = await passwordResetTokenRepo.findByHash(tokenHash);
    if (!record) throw new BadRequestError("Invalid or expired reset link.");
    if (record.usedAt !== null) throw new BadRequestError("This reset link has already been used.");
    if (record.expiresAt < new Date()) {
      throw new BadRequestError("This reset link has expired. Please request a new one.");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    await passwordResetTokenRepo.markUsedAndUpdatePassword(record.id, record.user.id, passwordHash);

    return { message: "Password updated successfully." };
  },

  async verifyEmail(input: VerifyEmailQuery): Promise<{ message: string }> {
    const tokenHash = crypto.createHash("sha256").update(input.token).digest("hex");
    const record = await emailVerificationTokenRepo.findByHash(tokenHash);
    if (!record) throw new BadRequestError("Invalid verification link.");

    // Idempotent: if the token was already used and the account is verified, treat as success.
    // Why: React StrictMode double-renders this in dev; users may also click the link twice.
    if (record.usedAt) {
      if (record.user.emailVerified) return { message: "Email verified successfully!" };
      throw new BadRequestError("Invalid verification link.");
    }
    if (record.expiresAt < new Date()) {
      throw new BadRequestError("This verification link has expired. Please register again.");
    }

    await emailVerificationTokenRepo.markUsedAndVerify(tokenHash, record.userId);
    return { message: "Email verified successfully!" };
  },

  /**
   * Resend always returns success (even when user is missing or already verified)
   * to avoid leaking account existence.
   */
  async resendVerification(input: ResendVerificationInput): Promise<{ message: string }> {
    const generic = { message: "Verification email sent." };
    const user = await userRepo.findByEmail(input.email);
    if (!user || user.emailVerified) return generic;

    await emailVerificationTokenRepo.deleteAllForUser(user.id);
    const { raw, hash } = newToken();
    await emailVerificationTokenRepo.create({
      userId: user.id,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + DAY_MS),
    });

    const verificationUrl = `${appUrl()}/verify-email?token=${raw}`;
    console.log(`[resend-verification] ${user.email} → ${verificationUrl}`);
    try {
      await sendVerificationEmail(user.email, verificationUrl, user.name);
    } catch (err) {
      console.error("[resend-verification] send failed:", err);
    }
    return generic;
  },
};
