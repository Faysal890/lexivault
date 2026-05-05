"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { authApi, ApiClientError } from "@/lib/api-client";

const LANGUAGES = ["Bengali", "Hindi", "Arabic", "Spanish", "French", "Portuguese", "Turkish", "Urdu", "Indonesian", "Other"];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email.trim());
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    nativeLanguage: "Bengali",
  });

  const emailValid = isValidEmail(form.email);
  const showEmailError = emailTouched && form.email.length > 0 && !emailValid;
  const showEmailOk = emailTouched && form.email.length > 0 && emailValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!emailValid) {
      setEmailTouched(true);
      toast.error("Please enter a valid email address");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.register(form);
      setRegisteredEmail(form.email.toLowerCase());
      if (data.devCode) setDevCode(data.devCode);
      setDone(true);
    } catch (err: unknown) {
      const msg = err instanceof ApiClientError ? err.message : "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-surface lg:grid lg:grid-cols-2">
      {/* Brand panel — desktop only */}
      <aside className="hidden lg:flex relative overflow-hidden bg-gradient-primary text-on-primary p-12 flex-col justify-between">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-[28rem] h-[28rem] rounded-full bg-white/10 blur-3xl" />
        <Link href="/" className="relative z-10 flex items-center gap-2">
          <img src="/logo-dark.svg" alt="LexiVault" className="h-10 w-auto" />
          <span className="text-2xl font-black tracking-tight font-headline">LexiVault</span>
        </Link>
        <div className="relative z-10 space-y-6 max-w-md">
          <h2 className="font-headline text-4xl font-extrabold leading-tight">Start your vocabulary journey.</h2>
          <p className="text-on-primary/80 text-lg leading-relaxed">Free forever. Add your first word in seconds and watch your knowledge compound, day by day.</p>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-4 max-w-md">
          <div className="flex items-center gap-2 text-sm text-on-primary/80"><span className="material-symbols-outlined text-base">local_fire_department</span> Daily streaks</div>
          <div className="flex items-center gap-2 text-sm text-on-primary/80"><span className="material-symbols-outlined text-base">psychology</span> Smart quizzes</div>
          <div className="flex items-center gap-2 text-sm text-on-primary/80"><span className="material-symbols-outlined text-base">show_chart</span> Progress stats</div>
          <div className="flex items-center gap-2 text-sm text-on-primary/80"><span className="material-symbols-outlined text-base">file_download</span> Export anywhere</div>
        </div>
      </aside>

      {/* Form panel */}
      <div className="flex flex-col items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-sm lg:max-w-md">
          <Link href="/" className="flex items-center justify-center gap-2 mb-10 lg:hidden">
            <img src="/logo-primary.svg" alt="LexiVault" className="h-9 w-auto" />
            <span className="text-3xl font-black font-headline text-on-surface">LexiVault</span>
          </Link>

          <div className="bg-surface-container-lowest rounded-3xl p-8 lg:p-10 shadow-sm lg:bg-transparent lg:shadow-none lg:p-0">
            {done ? (
              <div>
                <div className="text-center mb-6">
                  <span className="material-symbols-outlined text-5xl text-primary block mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_unread</span>
                  <h1 className="text-2xl lg:text-3xl font-bold font-headline mb-2">Check your email</h1>
                  <p className="text-on-surface-variant text-sm mb-1">
                    We sent a 6-digit verification code to
                  </p>
                  <p className="font-semibold text-on-surface text-sm break-all">{registeredEmail}</p>
                </div>

                {devCode && (
                  <div className="mb-5 p-3 bg-tertiary-container rounded-2xl text-center">
                    <p className="text-xs font-semibold text-on-tertiary-container mb-1">Dev mode — code not emailed</p>
                    <span className="text-2xl font-mono font-bold tracking-[0.4em] text-on-tertiary-container">{devCode}</span>
                  </div>
                )}

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (code.length < 6) { toast.error("Enter the full 6-digit code"); return; }
                    setVerifyLoading(true);
                    try {
                      await authApi.verifyEmail({ email: registeredEmail, code });
                      toast.success("Email verified! Please sign in.");
                      router.push("/login");
                    } catch (err: unknown) {
                      toast.error(err instanceof ApiClientError ? err.message : "Verification failed");
                    } finally {
                      setVerifyLoading(false);
                    }
                  }}
                  className="space-y-4"
                >
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
                      disabled={verifyLoading}
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={verifyLoading || code.length < 6}
                    className="btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {verifyLoading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                        Verifying…
                      </>
                    ) : "Verify Email"}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <Link href={`/verify-email?email=${encodeURIComponent(registeredEmail)}`} className="text-on-surface-variant text-sm hover:underline">
                    Didn&apos;t receive it? Resend code
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl lg:text-3xl font-bold font-headline mb-2">Create account</h1>
                <p className="text-on-surface-variant text-sm mb-8">Start your vocabulary journey today — free forever.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your full name"
                      className="input-field"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        onBlur={() => setEmailTouched(true)}
                        placeholder="you@example.com"
                        className={`input-field pr-10 ${showEmailError ? "border-error ring-1 ring-error" : showEmailOk ? "border-secondary ring-1 ring-secondary" : ""}`}
                        disabled={loading}
                      />
                      {showEmailOk && (
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary text-xl pointer-events-none" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      )}
                      {showEmailError && (
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-error text-xl pointer-events-none" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                      )}
                    </div>
                    {showEmailError && (
                      <p className="mt-1 text-xs text-error flex items-center gap-1">
                        Please enter a valid email address (e.g. you@example.com)
                      </p>
                    )}
                  </div>
                  <div className="lg:grid lg:grid-cols-2 lg:gap-4 space-y-4 lg:space-y-0">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Password</label>
                      <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="At least 8 characters"
                        className="input-field"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Native Language</label>
                      <select
                        value={form.nativeLanguage}
                        onChange={(e) => setForm({ ...form, nativeLanguage: e.target.value })}
                        className="input-field"
                        disabled={loading}
                      >
                        {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                        Creating account...
                      </>
                    ) : "Create Account"}
                  </button>
                </form>

                <p className="mt-4 text-center text-xs text-on-surface-variant/70">
                  By creating an account, you agree to our{" "}
                  <Link href="/privacy-policy" className="underline hover:text-on-surface-variant">
                    Privacy Policy
                  </Link>
                </p>

                <div className="mt-4 text-center text-sm text-on-surface-variant">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary font-bold hover:underline">Sign in</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
