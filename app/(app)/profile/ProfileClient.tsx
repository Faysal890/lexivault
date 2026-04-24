"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import { format } from "date-fns";

const LANGUAGES = ["Bengali", "Hindi", "Arabic", "Spanish", "French", "Portuguese", "Turkish", "Urdu", "Indonesian", "Other"];

interface Props {
  user: { id: string; name: string; email: string; nativeLanguage: string; dailyGoal: number; createdAt: Date };
  streak: { currentDays: number; longestDays: number; totalXP: number; level: number } | null;
}

export default function ProfileClient({ user, streak }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: user.name, nativeLanguage: user.nativeLanguage, dailyGoal: user.dailyGoal });
  const [securityOpen, setSecurityOpen] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Failed to update profile");
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pwForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      toast.success("Password changed successfully!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSecurityOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const initials = user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="py-4 space-y-6">
      <h1 className="font-headline text-3xl font-extrabold text-on-surface">Profile</h1>

      {/* Avatar & Name */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary font-headline text-2xl font-extrabold">
          {initials}
        </div>
        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface">{user.name}</h2>
          <p className="text-on-surface-variant text-sm">{user.email}</p>
          <p className="text-outline text-xs mt-0.5">Member since {format(new Date(user.createdAt), "MMMM yyyy")}</p>
        </div>
      </div>

      {/* Streak Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: "local_fire_department", v: streak?.currentDays ?? 0, l: "Streak" },
          { icon: "star", v: streak?.totalXP ?? 0, l: "Total XP" },
          { icon: "military_tech", v: `L${streak?.level ?? 1}`, l: "Level" },
        ].map((s) => (
          <div key={s.l} className="bg-surface-container-lowest rounded-2xl p-3 text-center">
            <span className="material-symbols-outlined text-primary text-xl block mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            <div className="font-headline font-extrabold text-on-surface">{s.v}</div>
            <div className="text-[10px] text-on-surface-variant font-semibold">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Settings */}
      <div className="bg-surface-container-lowest rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-bold text-on-surface">Settings</h3>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-primary text-sm font-bold">
              <span className="material-symbols-outlined text-base">edit</span> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="text-on-surface-variant text-sm font-semibold">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="text-primary text-sm font-bold">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Display Name</label>
            {editing ? (
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
            ) : (
              <p className="text-on-surface font-semibold">{user.name}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Native Language</label>
            {editing ? (
              <select value={form.nativeLanguage} onChange={e => setForm({ ...form, nativeLanguage: e.target.value })} className="input-field">
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            ) : (
              <p className="text-on-surface font-semibold">{user.nativeLanguage}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Daily Word Goal</label>
            {editing ? (
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map(n => (
                  <button key={n} type="button" onClick={() => setForm({ ...form, dailyGoal: n })}
                    className={`py-2 rounded-xl font-bold text-sm border-2 transition-all ${form.dailyGoal === n ? "border-primary bg-primary-fixed/20 text-primary" : "border-transparent bg-surface-container-high text-on-surface-variant"}`}>
                    {n}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-on-surface font-semibold">{user.dailyGoal} words/day</p>
            )}
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-surface-container-lowest rounded-3xl p-5">
        <button
          className="flex items-center justify-between w-full"
          onClick={() => setSecurityOpen((v) => !v)}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant">shield</span>
            <h3 className="font-headline font-bold text-on-surface">Security</h3>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-base">
            {securityOpen ? "expand_less" : "expand_more"}
          </span>
        </button>

        {securityOpen && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="input-field"
                disabled={changingPassword}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                placeholder="At least 8 characters"
                className="input-field"
                disabled={changingPassword}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                placeholder="Repeat new password"
                className="input-field"
                disabled={changingPassword}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setSecurityOpen(false); setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }}
                className="flex-1 py-3 rounded-xl border-2 border-outline-variant text-on-surface-variant font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-1"
              >
                {changingPassword ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                    Saving...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sign Out */}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="w-full py-4 rounded-2xl border-2 border-error/30 text-error font-bold font-headline flex items-center justify-center gap-2 hover:bg-error-container/20 transition-colors"
      >
        <span className="material-symbols-outlined">logout</span> Sign Out
      </button>
    </div>
  );
}
