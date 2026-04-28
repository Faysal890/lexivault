"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "home", label: "Home" },
  { href: "/words", icon: "menu_book", label: "Words" },
  { href: "/quiz", icon: "psychology", label: "Quiz" },
  { href: "/stats", icon: "show_chart", label: "Stats" },
  { href: "/profile", icon: "person", label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-white/90 backdrop-blur-lg shadow-2xl rounded-t-2xl border-t border-slate-100 lg:hidden">
      {NAV_ITEMS.map(({ href, icon, label }) => {
        const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex flex-col items-center justify-center px-3 py-1.5 rounded-2xl transition-all duration-200",
              isActive
                ? "bg-primary-fixed text-primary scale-110"
                : "text-slate-400 hover:text-on-surface"
            )}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {icon}
            </span>
            <span className="text-[10px] font-bold mt-0.5">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
