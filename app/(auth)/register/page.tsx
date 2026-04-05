"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

const LANGUAGES = ["Bengali", "Hindi", "Arabic", "Spanish", "French", "Portuguese", "Turkish", "Urdu", "Indonesian", "Other"];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    nativeLanguage: "Bengali",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      // Auto sign in after registration
      await signIn("credentials", {
        email: form.email.toLowerCase(),
        password: form.password,
        redirect: false,
      });
      toast.success("Account created! Welcome to Lexora 🎉");
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      toast.error(msg);
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
          <h1 className="text-2xl font-bold font-headline mb-2">Create account</h1>
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
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="input-field"
                disabled={loading}
              />
            </div>
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

          <div className="mt-6 text-center text-sm text-on-surface-variant">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
