"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: form.email.toLowerCase(),
        password: form.password,
        redirect: false,
      });
      if (result?.error === "EmailNotVerified") {
        router.push(`/verify-email?email=${encodeURIComponent(form.email.toLowerCase())}`);
      } else if (result?.error === "TooManyAttempts") {
        toast.error("Too many login attempts. Please wait a few minutes and try again.");
      } else if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Welcome back!");
        router.push("/dashboard");
        router.refresh();
      }
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
          <h2 className="font-headline text-4xl font-extrabold leading-tight">Master a new word every day.</h2>
          <p className="text-on-primary/80 text-lg leading-relaxed">Build your vocabulary with smart spaced repetition, AI-generated examples, and progress that actually sticks.</p>
        </div>
        <div className="relative z-10 flex items-center gap-6 text-sm text-on-primary/80">
          <div className="flex items-center gap-2"><span className="material-symbols-outlined text-base">bolt</span> Spaced Repetition</div>
          <div className="flex items-center gap-2"><span className="material-symbols-outlined text-base">auto_awesome</span> AI Examples</div>
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
            <h1 className="text-2xl lg:text-3xl font-bold font-headline mb-2">Welcome back</h1>
            <p className="text-on-surface-variant text-sm mb-8">Sign in to continue your learning journey.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-on-surface">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="input-field"
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-on-surface">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="input-field"
                  disabled={loading}
                  autoComplete="current-password"
                  required
                />
                <div className="text-right mt-1">
                  <Link href="/forgot-password" className="text-sm text-primary font-semibold hover:underline">
                    Forgot password?
                  </Link>
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
                    Signing in...
                  </>
                ) : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-on-surface-variant">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary font-bold hover:underline">
                Create one
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
