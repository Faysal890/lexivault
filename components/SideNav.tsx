"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import clsx from "clsx";
import { useCoins } from "@/contexts/CoinContext";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "home", label: "Home" },
  { href: "/words", icon: "menu_book", label: "Words" },
  { href: "/quiz", icon: "psychology", label: "Quiz" },
  { href: "/stats", icon: "show_chart", label: "Stats" },
  { href: "/store", icon: "storefront", label: "Store" },
  { href: "/profile", icon: "person", label: "Profile" },
];

export default function SideNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { coins } = useCoins();

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  return (
    <aside className="hidden lg:flex fixed top-0 left-0 z-40 h-dvh w-64 flex-col border-r border-surface-container-high bg-surface-container-lowest/80 backdrop-blur-md">
      <div className="px-6 py-7">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/logo-primary.svg" alt="LexiVault" className="h-9 w-auto dark:hidden" />
          <img src="/logo-dark.svg" alt="LexiVault" className="h-9 w-auto hidden dark:block" />
          <span className="text-2xl font-black tracking-tight text-on-surface font-headline">
            LexiVault
          </span>
        </Link>
      </div>

      {coins !== null && (
        <div className="mx-3 mb-2">
          <Link href="/store" className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-tertiary-fixed/30 hover:bg-tertiary-fixed/50 transition-colors">
            <span className="material-symbols-outlined text-[18px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
            <span className="text-sm font-bold text-tertiary">{coins.toLocaleString()} coins</span>
          </Link>
        </div>
      )}

      <nav className="flex-1 px-3 space-y-1">
        {[
          ...NAV_ITEMS,
          ...(session?.user?.role === "ADMIN"
            ? [{ href: "/admin", icon: "admin_panel_settings", label: "Admin" }]
            : []),
        ].map(({ href, icon, label }) => {
          const isActive =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all",
                isActive
                  ? "bg-primary-fixed text-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {icon}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-surface-container-high">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-surface-container-low">
          <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm font-headline shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm text-on-surface truncate">
              {session?.user?.name ?? "User"}
            </p>
            <p className="text-xs text-on-surface-variant truncate">
              {session?.user?.email ?? ""}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-2 rounded-xl text-on-surface-variant hover:bg-error-container/30 hover:text-error transition-colors shrink-0"
            title="Sign out"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
