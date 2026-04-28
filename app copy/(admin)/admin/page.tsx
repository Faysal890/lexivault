import { requireAdminId } from "@/lib/server/auth";
import { adminService } from "@/lib/server/services/admin.service";
import Link from "next/link";

export default async function AdminDashboardPage() {
  await requireAdminId();
  const stats = await adminService.getStats();

  const cards = [
    {
      icon: "group",
      label: "Total Users",
      value: stats.totalUsers,
      href: "/admin/users",
      bg: "bg-primary-fixed",
      text: "text-primary",
    },
    {
      icon: "person_add",
      label: "New Today",
      value: stats.newUsersToday,
      href: "/admin/users",
      bg: "bg-secondary-container",
      text: "text-secondary",
    },
    {
      icon: "calendar_this_week",
      label: "New This Week",
      value: stats.newUsersThisWeek,
      href: null,
      bg: "bg-tertiary-fixed",
      text: "text-tertiary",
    },
    {
      icon: "menu_book",
      label: "Total Words",
      value: stats.totalWords,
      href: "/admin/words",
      bg: "bg-primary-fixed",
      text: "text-primary",
    },
    {
      icon: "psychology",
      label: "Total Quizzes",
      value: stats.totalQuizzes,
      href: null,
      bg: "bg-surface-container",
      text: "text-on-surface-variant",
    },
    {
      icon: "timeline",
      label: "Active Today",
      value: stats.activeToday,
      href: null,
      bg: "bg-surface-container",
      text: "text-on-surface-variant",
    },
  ];

  return (
    <div className="py-4 space-y-6 lg:py-0 lg:space-y-8">
      <header>
        <p className="text-secondary font-semibold text-xs tracking-wider uppercase mb-1">
          Admin Panel
        </p>
        <h1 className="font-headline text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight">
          Platform Overview
        </h1>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-5">
        {cards.map((c) => {
          const inner = (
            <div
              className={`bg-surface-container-lowest p-5 lg:p-6 rounded-2xl shadow-sm flex flex-col gap-3 ${c.href ? "hover:shadow-md transition-shadow" : ""}`}
            >
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-[20px] ${c.text}`}>{c.icon}</span>
              </div>
              <div>
                <span className="font-headline text-3xl font-extrabold text-on-surface">
                  {c.value.toLocaleString()}
                </span>
                <p className="text-on-surface-variant text-sm font-medium">{c.label}</p>
              </div>
            </div>
          );
          return c.href ? (
            <Link key={c.label} href={c.href}>
              {inner}
            </Link>
          ) : (
            <div key={c.label}>{inner}</div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Link
          href="/admin/users"
          className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <span className="material-symbols-outlined text-primary text-3xl">manage_accounts</span>
          <div>
            <h3 className="font-headline font-bold text-on-surface">Manage Users</h3>
            <p className="text-on-surface-variant text-sm">View, search, change roles, delete</p>
          </div>
          <span className="material-symbols-outlined text-outline ml-auto">arrow_forward</span>
        </Link>
        <Link
          href="/admin/words"
          className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <span className="material-symbols-outlined text-tertiary text-3xl">menu_book</span>
          <div>
            <h3 className="font-headline font-bold text-on-surface">All Words</h3>
            <p className="text-on-surface-variant text-sm">Browse and moderate vocabulary entries</p>
          </div>
          <span className="material-symbols-outlined text-outline ml-auto">arrow_forward</span>
        </Link>
      </section>
    </div>
  );
}
