"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || token.length !== 64 || !/^[a-f0-9]+$/.test(token)) {
      setTokenError("This reset link is invalid or malformed. Please request a new one.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.password || !form.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password, confirmPassword: form.confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      toast.success("Password reset successfully! Please sign in.");
      router.push("/login");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-surface flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center mb-10">
          <span className="text-3xl font-black font-headline text-on-surface">Lexora</span>
        </Link>

        <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm">
          {tokenError ? (
            <div className="text-center py-4">
              <span
                className="material-symbols-outlined text-5xl text-error mb-4 block"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                link_off
              </span>
              <h2 className="text-xl font-bold font-headline mb-2">Invalid link</h2>
              <p className="text-on-surface-variant text-sm mb-6">{tokenError}</p>
              <Link href="/forgot-password" className="btn-primary text-center block">
                Request New Link
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">lock</span>
                <div>
                  <h1 className="text-2xl font-bold font-headline">Set new password</h1>
                  <p className="text-on-surface-variant text-sm">Must be at least 8 characters.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-on-surface">New Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="At least 8 characters"
                    className="input-field"
                    disabled={loading}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-on-surface">Confirm New Password</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Repeat your new password"
                    className="input-field"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !token}
                  className="btn-primary mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            </>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-surface" />}>
      <ResetForm />
    </Suspense>
  );
}
