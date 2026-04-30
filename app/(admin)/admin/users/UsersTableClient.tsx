"use client";
import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi } from "@/lib/api-client/admin";
import type { AdminUserRowDto, PaginatedDto } from "@/lib/server/dto/admin";

interface Props {
  initialData: PaginatedDto<AdminUserRowDto>;
  initialQuery: { page: number; limit: number; search: string; role?: "USER" | "ADMIN" };
}

function CoinPopover({
  user,
  onUpdated,
}: {
  user: AdminUserRowDto;
  onUpdated: (id: string, coins: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<"add" | "set">("add");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = parseInt(amount);
    if (isNaN(n) || n < 0) return;
    setLoading(true);
    try {
      const result =
        action === "add"
          ? await adminApi.grantCoins(user.id, n)
          : await adminApi.setCoins(user.id, n);
      onUpdated(user.id, result.coins);
      setAmount("");
      setOpen(false);
    } catch {
      // keep open on error
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-tertiary-fixed/30 hover:bg-tertiary-fixed/60 transition-colors"
        title="Manage coins"
      >
        <span
          className="material-symbols-outlined text-[13px] text-tertiary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          toll
        </span>
        <span className="text-xs font-bold text-tertiary">{user.coins.toLocaleString()}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container-high p-4 w-64">
            <p className="text-xs font-bold text-on-surface mb-3">
              Coins for {user.name.split(" ")[0]}
            </p>
            <div className="flex gap-1 mb-3">
              <button
                type="button"
                onClick={() => setAction("add")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  action === "add"
                    ? "bg-secondary-container text-on-secondary-container border-secondary"
                    : "border-transparent bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setAction("set")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  action === "set"
                    ? "bg-tertiary-fixed text-tertiary border-tertiary"
                    : "border-transparent bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                Set
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={action === "add" ? "Amount" : "New total"}
                className="input-field text-xs flex-1 py-1.5"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !amount}
                className="px-3 py-1.5 bg-primary text-on-primary rounded-xl text-xs font-bold disabled:opacity-60 hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                {loading ? "..." : action === "add" ? "Grant" : "Set"}
              </button>
            </form>
            <p className="text-[10px] text-on-surface-variant mt-2">
              Current: <span className="font-bold text-tertiary">{user.coins.toLocaleString()}</span> coins
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default function UsersTableClient({ initialData, initialQuery }: Props) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState(initialQuery.search);
  const [roleFilter, setRoleFilter] = useState<"" | "USER" | "ADMIN">(initialQuery.role ?? "");
  const [page, setPage] = useState(initialQuery.page);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function load(p: number, s: string, r: string) {
    setError(null);
    try {
      const result = await adminApi.listUsers({
        page: p,
        search: s || undefined,
        role: r || undefined,
      });
      setData(result);
      setPage(p);
    } catch {
      setError("Failed to load users.");
    }
  }

  function handleSearch(value: string) {
    setSearch(value);
    startTransition(() => load(1, value, roleFilter));
  }

  function handleRoleFilter(r: "" | "USER" | "ADMIN") {
    setRoleFilter(r);
    startTransition(() => load(1, search, r));
  }

  function handleCoinsUpdated(userId: string, newCoins: number) {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((u) => (u.id === userId ? { ...u, coins: newCoins } : u)),
    }));
  }

  async function handleRoleToggle(user: AdminUserRowDto) {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    if (!window.confirm(`Change ${user.name}'s role to ${newRole}?`)) return;
    try {
      await adminApi.updateRole(user.id, newRole);
      await load(page, search, roleFilter);
    } catch {
      setError("Failed to update role.");
    }
  }

  async function handleDelete(user: AdminUserRowDto) {
    if (
      !window.confirm(
        `Delete user "${user.name}" (${user.email})? This will permanently delete all their words, quizzes, and data.`
      )
    )
      return;
    try {
      await adminApi.deleteUser(user.id);
      await load(page, search, roleFilter);
      router.refresh();
    } catch {
      setError("Failed to delete user.");
    }
  }

  return (
    <div className="py-4 space-y-5 lg:py-0 lg:space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-secondary font-semibold text-xs tracking-wider uppercase mb-1">
            Admin Panel
          </p>
          <h1 className="font-headline text-2xl lg:text-3xl font-extrabold text-on-surface tracking-tight">
            Users
          </h1>
        </div>
        <Link
          href="/admin"
          className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Overview
        </Link>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            className="input-field pl-10"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(["", "USER", "ADMIN"] as const).map((r) => (
            <button
              key={r}
              onClick={() => handleRoleFilter(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                roleFilter === r
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {r === "" ? "All" : r}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-error text-sm bg-error-container/20 px-4 py-3 rounded-xl">{error}</p>
      )}

      <div className={`space-y-3 ${isPending ? "opacity-60" : ""}`}>
        {data.items.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-10 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 block">group_off</span>
            No users found.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block bg-surface-container-lowest rounded-3xl p-6 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-on-surface-variant border-b border-surface-container-high">
                    <th className="pb-3 font-semibold">User</th>
                    <th className="pb-3 font-semibold">Role</th>
                    <th className="pb-3 font-semibold text-center">Words</th>
                    <th className="pb-3 font-semibold text-center">Quizzes</th>
                    <th className="pb-3 font-semibold">Coins</th>
                    <th className="pb-3 font-semibold">Joined</th>
                    <th className="pb-3 font-semibold">Verified</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high">
                  {data.items.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-container/30 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface">{user.name}</p>
                            <p className="text-on-surface-variant text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            user.role === "ADMIN"
                              ? "bg-primary-fixed text-primary"
                              : "bg-surface-container text-on-surface-variant"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-center text-on-surface">{user.wordCount}</td>
                      <td className="py-3 pr-4 text-center text-on-surface">{user.quizCount}</td>
                      <td className="py-3 pr-4">
                        <CoinPopover user={user} onUpdated={handleCoinsUpdated} />
                      </td>
                      <td className="py-3 pr-4 text-on-surface-variant text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 pr-4">
                        {user.emailVerified ? (
                          <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                            check_circle
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-[18px] text-outline">
                            cancel
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="p-1.5 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                            title="View details"
                          >
                            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                          </Link>
                          <button
                            onClick={() => handleRoleToggle(user)}
                            className="p-1.5 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-secondary transition-colors"
                            title={user.role === "ADMIN" ? "Demote to USER" : "Promote to ADMIN"}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {user.role === "ADMIN" ? "person" : "admin_panel_settings"}
                            </span>
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-1.5 rounded-xl text-on-surface-variant hover:bg-error-container/30 hover:text-error transition-colors"
                            title="Delete user"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden space-y-3">
              {data.items.map((user) => (
                <div
                  key={user.id}
                  className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-on-surface truncate">{user.name}</p>
                        <p className="text-on-surface-variant text-xs truncate">{user.email}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                        user.role === "ADMIN"
                          ? "bg-primary-fixed text-primary"
                          : "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-on-surface-variant flex-wrap">
                    <span>{user.wordCount} words</span>
                    <span>{user.quizCount} quizzes</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
                      <span className="font-semibold text-tertiary">{user.coins.toLocaleString()} coins</span>
                    </span>
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-surface-container-high">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-surface-container text-on-surface-variant text-xs font-semibold hover:bg-surface-container-high transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      View
                    </Link>
                    <button
                      onClick={() => handleRoleToggle(user)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-surface-container text-on-surface-variant text-xs font-semibold hover:bg-surface-container-high transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {user.role === "ADMIN" ? "person" : "admin_panel_settings"}
                      </span>
                      {user.role === "ADMIN" ? "Demote" : "Promote"}
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-error-container/20 text-error text-xs font-semibold hover:bg-error-container/40 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-on-surface-variant">
            {data.total} users · page {data.page} of {data.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => startTransition(() => load(page - 1, search, roleFilter))}
              className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant text-sm font-semibold disabled:opacity-40 hover:bg-surface-container-high transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page >= data.totalPages}
              onClick={() => startTransition(() => load(page + 1, search, roleFilter))}
              className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant text-sm font-semibold disabled:opacity-40 hover:bg-surface-container-high transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
