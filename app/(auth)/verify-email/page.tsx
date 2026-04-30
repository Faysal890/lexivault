"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { authApi, ApiClientError } from "@/lib/api-client";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || code.length < 6) {
      toast.error("Please enter your email and the 6-digit code");
      return;
    }
    setLoading(true);
    try {
      await authApi.verifyEmail({ email: email.toLowerCase(), code });
      setVerified(true);
    } catch (err: unknown) {
      toast.error(err instanceof ApiClientError ? err.message : "Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Please enter your email address first");
      return;
    }
    setResendLoading(true);
    try {
      await authApi.resendVerification({ email: email.toLowerCase() });
      setResendSent(true);
      setCode("");
      toast.success("New code sent — check your inbox");
    } catch (err: unknown) {
      toast.error(err instanceof ApiClientError ? err.message : "Could not resend. Try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-surface flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm lg:max-w-md">
        <Link href="/" className="block text-center mb-10">
          <span className="text-3xl lg:text-4xl font-black font-headline text-on-surface">LexiVault</span>
        </Link>

        <div className="bg-surface-container-lowest rounded-3xl p-8 lg:p-10 shadow-sm text-center">
          {verified ? (
            <>
              <span
                className="material-symbols-outlined text-5xl text-secondary block mb-4"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <h1 className="text-xl font-bold font-headline mb-2">Email verified!</h1>
              <p className="text-on-surface-variant text-sm mb-6">
                Your account is active. You can now sign in.
              </p>
              <Link href="/login" className="btn-primary inline-flex items-center justify-center gap-2">
                Sign In
              </Link>
            </>
          ) : (
            <>
              <span
                className="material-symbols-outlined text-5xl text-primary block mb-4"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                mark_email_unread
              </span>
              <h1 className="text-xl font-bold font-headline mb-2">Verify your email</h1>
              <p className="text-on-surface-variant text-sm mb-6">
                {resendSent
                  ? "A new code has been sent. Enter it below."
                  : "Enter the 6-digit code we sent to your email."}
              </p>

              <form onSubmit={handleVerify} className="space-y-4 text-left">
                {!emailFromUrl && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-field"
                      disabled={loading}
                    />
                  </div>
                )}
                {emailFromUrl && (
                  <p className="text-sm font-semibold text-on-surface text-center break-all mb-2">
                    {email}
                  </p>
                )}
                <div>
                  <label className="block text-sm font-semibold mb-2">Verification code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    className="input-field text-center text-2xl tracking-[0.4em] font-mono"
                    disabled={loading}
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="btn-primary flex items-center justify-center gap-2 disabled:opacity-60 w-full"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                      Verifying…
                    </>
                  ) : (
                    "Verify Email"
                  )}
                </button>
              </form>

              <div className="mt-5 flex flex-col items-center gap-2">
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-primary text-sm font-semibold hover:underline disabled:opacity-60"
                >
                  {resendLoading ? "Sending…" : "Resend code"}
                </button>
                <Link href="/login" className="text-on-surface-variant text-sm hover:underline">
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
