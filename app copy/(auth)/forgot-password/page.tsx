"use client";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { authApi, ApiClientError } from "@/lib/api-client";

type Stage = "form" | "sent";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<Stage>("form");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setStage("sent");
    } catch (err: unknown) {
      const msg = err instanceof ApiClientError ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-surface flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm lg:max-w-md">
        <Link href="/" className="block text-center mb-10">
          <span className="text-3xl lg:text-4xl font-black font-headline text-on-surface">Lexora</span>
        </Link>

        <div className="bg-surface-container-lowest rounded-3xl p-8 lg:p-10 shadow-sm">
          {stage === "form" ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">lock_reset</span>
                <div>
                  <h1 className="text-2xl font-bold font-headline">Forgot password?</h1>
                  <p className="text-on-surface-variant text-sm">
                    No worries, we&apos;ll send you reset instructions.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-on-surface">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field"
                    disabled={loading}
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <span
                className="material-symbols-outlined text-5xl text-primary mb-4 block"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                mark_email_read
              </span>
              <h2 className="text-xl font-bold font-headline mb-2">Check your inbox</h2>
              <p className="text-on-surface-variant text-sm mb-6">
                If <strong>{email}</strong> is registered, you&apos;ll receive a password reset
                link within a few minutes. Check your spam folder if you don&apos;t see it.
              </p>
              <button
                onClick={() => { setStage("form"); setEmail(""); }}
                className="text-primary font-semibold text-sm hover:underline"
              >
                Try a different email
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="flex items-center justify-center gap-1 text-primary text-sm font-bold hover:underline"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
