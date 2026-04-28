"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi } from "@/lib/api-client/admin";
import type { AdminUserDetailDto } from "@/lib/server/dto/admin";

interface Props {
  user: AdminUserDetailDto;
  adminId: string;
}

export default function UserDetailClient({ user: initialUser, adminId }: Props) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isSelf = user.id === adminId;

  async function handleRoleToggle() {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    if (!window.confirm(`Change role to ${newRole}?`)) return;
    setLoading(true);
    setError(null);
    try {
      await adminApi.updateRole(user.id, newRole);
      setUser((u) => ({ ...u, role: newRole }));
    } catch {
      setError("Failed to update role.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Permanently delete user "${user.name}"? All their data will be lost.`
      )
    )
      return;
    setLoading(true);
    setError(null);
    try {
      await adminApi.deleteUser(user.id);
      router.push("/admin/users");
      router.refresh();
    } catch {
      setError("Failed to delete user.");
      setLoading(false);
    }
  }

  return (
    <div className="py-4 space-y-5 lg:py-0 lg:space-y-6">
      <header className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Users
        </Link>
        <p className="text-on-surface-variant text-sm">/ {user.name}</p>
      </header>

      {error && (
        <p className="text-error text-sm bg-error-container/20 px-4 py-3 rounded-xl">{error}</p>
      )}

      <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xl font-headline shrink-0">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-headline text-xl font-bold text-on-surface">{user.name}</h2>
              <p className="text-on-surface-variant text-sm">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    user.role === "ADMIN"
                      ? "bg-primary-fixed text-primary"
                      : "bg-surface-container text-on-surface-variant"
                  }`}
                >
                  {user.role}
                </span>
                {user.emailVerified ? (
                  <span className="flex items-center gap-0.5 text-xs text-primary">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-xs text-outline">
                    <span className="material-symbols-outlined text-[14px]">cancel</span>
                    Unverified
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleRoleToggle}
              disabled={isSelf || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container text-on-surface-variant text-xs font-semibold hover:bg-surface-container-high transition-colors disabled:opacity-40"
              title={isSelf ? "Cannot change your own role" : undefined}
            >
              <span className="material-symbols-outlined text-[16px]">
                {user.role === "ADMIN" ? "person" : "admin_panel_settings"}
              </span>
              {user.role === "ADMIN" ? "Demote" : "Promote"}
            </button>
            <button
              onClick={handleDelete}
              disabled={isSelf || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-error-container/20 text-error text-xs font-semibold hover:bg-error-container/40 transition-colors disabled:opacity-40"
              title={isSelf ? "Cannot delete your own account" : undefined}
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5 lg:grid-cols-4">
          {[
            { label: "Native Language", value: user.nativeLanguage },
            { label: "Daily Goal", value: `${user.dailyGoal} words` },
            { label: "Member Since", value: new Date(user.createdAt).toLocaleDateString() },
            { label: "Email Verified", value: user.emailVerified ? new Date(user.emailVerified).toLocaleDateString() : "—" },
          ].map((item) => (
            <div key={item.label} className="bg-surface-container rounded-xl p-3">
              <p className="text-on-surface-variant text-xs">{item.label}</p>
              <p className="font-semibold text-on-surface text-sm mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: "menu_book", label: "Words", value: user.wordCount, color: "text-primary" },
          { icon: "psychology", label: "Quizzes", value: user.quizCount, color: "text-secondary" },
          { icon: "local_fire_department", label: "Streak", value: `${user.streak?.currentDays ?? 0}d`, color: "text-tertiary" },
          { icon: "bolt", label: "XP / Level", value: `${user.streak?.totalXP ?? 0} / Lv${user.streak?.level ?? 1}`, color: "text-on-surface-variant" },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex flex-col gap-1">
            <span className={`material-symbols-outlined ${stat.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {stat.icon}
            </span>
            <span className="font-headline text-xl font-bold text-on-surface">{stat.value}</span>
            <span className="text-on-surface-variant text-xs">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm">
          <h3 className="font-headline font-bold text-on-surface mb-3">Recent Words</h3>
          {user.recentWords.length === 0 ? (
            <p className="text-on-surface-variant text-sm">No words yet.</p>
          ) : (
            <ul className="space-y-2">
              {user.recentWords.map((w) => (
                <li key={w.id} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-on-surface text-sm">{w.englishWord}</p>
                    <p className="text-on-surface-variant text-xs">{w.meaning}</p>
                  </div>
                  <span className="text-on-surface-variant text-xs shrink-0">
                    {new Date(w.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm">
          <h3 className="font-headline font-bold text-on-surface mb-3">Recent Quizzes</h3>
          {user.recentQuizzes.length === 0 ? (
            <p className="text-on-surface-variant text-sm">No quizzes yet.</p>
          ) : (
            <ul className="space-y-2">
              {user.recentQuizzes.map((q) => {
                const pct = Math.round((q.score / q.totalQuestions) * 100);
                return (
                  <li key={q.id} className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-on-surface text-sm">
                        {q.score}/{q.totalQuestions}
                        <span className="ml-1 text-xs text-on-surface-variant">({pct}%)</span>
                      </p>
                    </div>
                    <span className="text-on-surface-variant text-xs">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
