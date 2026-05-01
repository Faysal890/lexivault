import { hashPassword } from "@/lib/server/password";
import crypto from "crypto";
import { BadRequestError, ConflictError } from "../errors";
import { userRepo } from "../repositories/user.repo";
import { emailVerificationTokenRepo, passwordResetTokenRepo } from "../repositories/token.repo";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";
import { coinService } from "./coin.service";
import { settingsService } from "./settings.service";
import type {
  ForgotPasswordInput,
  RegisterInput,
  ResendVerificationInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "../dto/auth";

const HOUR_MS = 60 * 60 * 1000;
const OTP_TTL_MS = 15 * 60 * 1000; // 15 minutes

function appUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000"
  );
}

function newToken() {
  const raw = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
}

function newOtpCode() {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const hash = crypto.createHash("sha256").update(code).digest("hex");
  return { code, hash };
}

export const authService = {
  async register(input: RegisterInput): Promise<{ message: string; devCode?: string }> {
    const existing = await userRepo.findByEmail(input.email);
    if (existing) throw new ConflictError("Email already in use");

    const passwordHash = await hashPassword(input.password);
    const user = await userRepo.createWithStreak({
      name: input.name,
      email: input.email,
      passwordHash,
      nativeLanguage: input.nativeLanguage,
    });

    const settings = await settingsService.getSettings();
    if (settings.newUserCoins > 0) {
      await coinService.addCoins(user.id, settings.newUserCoins, "NEW_USER_BONUS", "Welcome bonus");
    }

    const { code, hash } = newOtpCode();
    await emailVerificationTokenRepo.create({
      userId: user.id,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`[verify-email] ${user.email} → code: ${code}`);
    }
    try {
      await sendVerificationEmail(user.email, code, user.name);
    } catch (err) {
      console.error("[verify-email] send failed");
      if (process.env.NODE_ENV !== "production") console.error(err);
    }

    return {
      message: "Account created! Check your email for the 6-digit verification code.",
      ...(process.env.NODE_ENV === "development" ? { devCode: code } : {}),
    };
  },

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
      console.error("[forgot-password] send failed");
      if (process.env.NODE_ENV !== "production") console.error(err);
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

    const passwordHash = await hashPassword(input.password);
    await passwordResetTokenRepo.markUsedAndUpdatePassword(record.id, record.user.id, passwordHash);

    return { message: "Password updated successfully." };
  },

  async verifyEmail(input: VerifyEmailInput): Promise<{ message: string }> {
    const user = await userRepo.findByEmail(input.email);
    if (!user) throw new BadRequestError("Invalid verification code.");
    if (user.emailVerified) return { message: "Email already verified!" };

    const codeHash = crypto.createHash("sha256").update(input.code).digest("hex");
    const record = await emailVerificationTokenRepo.findByHash(codeHash);

    if (!record || record.userId !== user.id) throw new BadRequestError("Invalid verification code.");
    if (record.usedAt) throw new BadRequestError("This code has already been used. Please request a new one.");
    if (record.expiresAt < new Date()) throw new BadRequestError("This code has expired. Please request a new one.");

    await emailVerificationTokenRepo.markUsedAndVerify(codeHash, user.id);
    return { message: "Email verified successfully!" };
  },

  async resendVerification(input: ResendVerificationInput): Promise<{ message: string }> {
    const generic = { message: "Verification code sent." };
    const user = await userRepo.findByEmail(input.email);
    if (!user || user.emailVerified) return generic;

    await emailVerificationTokenRepo.deleteAllForUser(user.id);
    const { code, hash } = newOtpCode();
    await emailVerificationTokenRepo.create({
      userId: user.id,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`[resend-verification] ${user.email} → code: ${code}`);
    }
    try {
      await sendVerificationEmail(user.email, code, user.name);
    } catch (err) {
      console.error("[resend-verification] send failed");
      if (process.env.NODE_ENV !== "production") console.error(err);
    }
    return generic;
  },
};
