"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi, ApiClientError } from "@/lib/api-client";

type VerifyStatus = "loading" | "success" | "error";
type ResendStatus = "idle" | "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const mode = token ? "verify" : "resend";

  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>("loading");
  const [verifyMessage, setVerifyMessage] = useState("");

  const [resendStatus, setResendStatus] = useState<ResendStatus>("idle");
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (mode !== "verify") return;
    if (!token) {
      setVerifyStatus("error");
      setVerifyMessage("No verification token found in the link.");
      return;
    }
    authApi
      .verifyEmail(token)
      .then(() => setVerifyStatus("success"))
      .catch((err: unknown) => {
        setVerifyStatus("error");
        setVerifyMessage(
          err instanceof ApiClientError ? err.message : "Something went wrong. Please try again."
        );
      });
  }, [token, mode]);

  const handleResend = async () => {
    setResendStatus("loading");
    setResendMessage("");
    if (!email) {
      setResendStatus("error");
      setResendMessage("No email address provided.");
      return;
    }
    try {
      await authApi.resendVerification({ email });
      setResendStatus("success");
    } catch (err: unknown) {
      setResendStatus("error");
      setResendMessage(
        err instanceof ApiClientError ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="min-h-dvh bg-surface flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm lg:max-w-md">
        <Link href="/" className="block text-center mb-10">
          <span className="text-3xl lg:text-4xl font-black font-headline text-on-surface">Lexora</span>
        </Link>

        <div className="bg-surface-container-lowest rounded-3xl p-8 lg:p-10 shadow-sm text-center">

          {/* ── Verify mode (token in URL) ── */}
          {mode === "verify" && (
            <>
              {verifyStatus === "loading" && (
                <>
                  <span className="material-symbols-outlined text-5xl text-primary animate-spin block mb-4">refresh</span>
                  <h1 className="text-xl font-bold font-headline mb-2">Verifying your email…</h1>
                  <p className="text-on-surface-variant text-sm">Please wait a moment.</p>
                </>
              )}

              {verifyStatus === "success" && (
                <>
                  <span className="material-symbols-outlined text-5xl text-secondary block mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <h1 className="text-xl font-bold font-headline mb-2">Email verified!</h1>
                  <p className="text-on-surface-variant text-sm mb-6">Your account is active. You can now sign in.</p>
                  <Link href="/login" className="btn-primary inline-flex items-center justify-center gap-2">
                    Sign In
                  </Link>
                </>
              )}

              {verifyStatus === "error" && (
                <>
                  <span className="material-symbols-outlined text-5xl text-error block mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                  <h1 className="text-xl font-bold font-headline mb-2">Verification failed</h1>
                  <p className="text-on-surface-variant text-sm mb-6">{verifyMessage}</p>
                  <Link href="/login" className="text-primary font-semibold hover:underline text-sm">
                    Back to sign in
                  </Link>
                </>
              )}
            </>
          )}

          {/* ── Resend mode (email in URL, no token) ── */}
          {mode === "resend" && (
            <>
              {resendStatus !== "success" && (
                <>
                  <span className="material-symbols-outlined text-5xl text-tertiary block mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_unread</span>
                  <h1 className="text-xl font-bold font-headline mb-2">Verify your email</h1>
                  <p className="text-on-surface-variant text-sm mb-2">
                    Your account isn&apos;t verified yet. We sent a link to:
                  </p>
                  {email && (
                    <p className="font-semibold text-on-surface text-sm mb-6 break-all">{email}</p>
                  )}
                  <p className="text-on-surface-variant text-sm mb-6">
                    Didn&apos;t receive it? We&apos;ll send a fresh one — any previous link will be invalidated.
                  </p>

                  {resendStatus === "error" && (
                    <p className="text-error text-sm mb-4">{resendMessage}</p>
                  )}

                  <button
                    onClick={handleResend}
                    disabled={resendStatus === "loading"}
                    className="btn-primary flex items-center justify-center gap-2 disabled:opacity-60 w-full"
                  >
                    {resendStatus === "loading" ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                        Sending…
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">send</span>
                        Resend Verification Email
                      </>
                    )}
                  </button>

                  <div className="mt-4">
                    <Link href="/login" className="text-on-surface-variant text-sm hover:underline">
                      Back to sign in
                    </Link>
                  </div>
                </>
              )}

              {resendStatus === "success" && (
                <>
                  <span className="material-symbols-outlined text-5xl text-secondary block mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
                  <h1 className="text-xl font-bold font-headline mb-2">Check your inbox</h1>
                  <p className="text-on-surface-variant text-sm mb-6">
                    A new verification link has been sent to{" "}
                    <span className="font-semibold text-on-surface">{email}</span>.
                    It expires in 24 hours.
                  </p>
                  <Link href="/login" className="text-primary font-semibold hover:underline text-sm">
                    Back to sign in
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
