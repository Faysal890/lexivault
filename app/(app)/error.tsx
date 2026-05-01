"use client";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="py-20 text-center space-y-4">
      <span className="material-symbols-outlined text-5xl text-error block">error</span>
      <h2 className="font-headline text-xl font-bold text-on-surface">Something went wrong</h2>
      <p className="text-on-surface-variant text-sm">An unexpected error occurred. Please try again.</p>
      <button onClick={reset} className="btn-primary w-auto px-8 py-3 inline-flex items-center gap-2 rounded-2xl bg-gradient-primary text-on-primary font-bold">
        <span className="material-symbols-outlined text-base">refresh</span> Try again
      </button>
    </div>
  );
}
