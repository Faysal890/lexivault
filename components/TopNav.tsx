"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function TopNav() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm lg:hidden">
        <div className="flex justify-between items-center px-4 py-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <img src="/logo-primary.svg" alt="Lexora" className="h-8 w-auto dark:hidden" />
            <img src="/logo-dark.svg" alt="Lexora" className="h-8 w-auto hidden dark:block" />
            <Link href="/dashboard" className="text-xl font-black tracking-tight text-on-surface font-headline">
              Lexora
            </Link>
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 p-1 rounded-full"
          >
            <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm font-headline">
              {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
          </button>
        </div>
      </nav>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="fixed top-14 right-4 z-50 bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container-high p-2 w-48">
          <div className="px-3 py-2 border-b border-surface-container-high mb-1">
            <p className="font-bold text-sm text-on-surface truncate">{session?.user?.name}</p>
            <p className="text-xs text-on-surface-variant truncate">{session?.user?.email}</p>
          </div>
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-primary hover:bg-primary-fixed/30 transition-colors"
            >
              <span className="material-symbols-outlined text-base">admin_panel_settings</span> Admin Panel
            </Link>
          )}
          <Link href="/profile" onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-on-surface hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-base">person</span> Profile
          </Link>
          <button
            onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-error hover:bg-error-container/30 transition-colors w-full"
          >
            <span className="material-symbols-outlined text-base">logout</span> Sign out
          </button>
        </div>
      )}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      )}
    </>
  );
}
