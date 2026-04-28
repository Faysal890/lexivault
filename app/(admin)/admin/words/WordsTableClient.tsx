"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi } from "@/lib/api-client/admin";
import type { AdminWordRowDto, PaginatedDto } from "@/lib/server/dto/admin";

const DIFFICULTY_LABELS: Record<number, { label: string; cls: string }> = {
  1: { label: "Easy",   cls: "bg-green-100 text-green-700" },
  2: { label: "Medium", cls: "bg-yellow-100 text-yellow-700" },
  3: { label: "Hard",   cls: "bg-red-100 text-red-700" },
};

interface Props {
  initialData: PaginatedDto<AdminWordRowDto>;
  initialQuery: { page: number; limit: number; search: string; userId?: string };
}

export default function WordsTableClient({ initialData, initialQuery }: Props) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState(initialQuery.search);
  const [page, setPage] = useState(initialQuery.page);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function load(p: number, s: string) {
    setError(null);
    try {
      const result = await adminApi.listWords({ page: p, search: s || undefined });
      setData(result);
      setPage(p);
    } catch {
      setError("Failed to load words.");
    }
  }

  function handleSearch(value: string) {
    setSearch(value);
    startTransition(() => load(1, value));
  }

  async function handleDelete(word: AdminWordRowDto) {
    if (
      !window.confirm(
        `Delete word "${word.englishWord}" (owned by ${word.userName})? This cannot be undone.`
      )
    )
      return;
    try {
      await adminApi.deleteWord(word.id);
      await load(page, search);
      router.refresh();
    } catch {
      setError("Failed to delete word.");
    }
  }

  const diffLabel = (level: number) =>
    DIFFICULTY_LABELS[level] ?? { label: String(level), cls: "bg-surface-container text-on-surface-variant" };

  return (
    <div className="py-4 space-y-5 lg:py-0 lg:space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-secondary font-semibold text-xs tracking-wider uppercase mb-1">
            Admin Panel
          </p>
          <h1 className="font-headline text-2xl lg:text-3xl font-extrabold text-on-surface tracking-tight">
            All Words
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

      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
          search
        </span>
        <input
          className="input-field pl-10"
          placeholder="Search by word…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-error text-sm bg-error-container/20 px-4 py-3 rounded-xl">{error}</p>
      )}

      <div className={`space-y-3 ${isPending ? "opacity-60" : ""}`}>
        {data.items.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-10 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 block">menu_book</span>
            No words found.
          </div>
        ) : (
          <>
            <div className="hidden lg:block bg-surface-container-lowest rounded-3xl p-6 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-on-surface-variant border-b border-surface-container-high">
                    <th className="pb-3 font-semibold">Word</th>
                    <th className="pb-3 font-semibold">Difficulty</th>
                    <th className="pb-3 font-semibold">Tags</th>
                    <th className="pb-3 font-semibold">User</th>
                    <th className="pb-3 font-semibold">Added</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high">
                  {data.items.map((word) => {
                    const diff = diffLabel(word.difficultyLevel);
                    const tags = word.tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean);
                    return (
                      <tr key={word.id} className="hover:bg-surface-container/30 transition-colors">
                        <td className="py-3 pr-4">
                          <p className="font-semibold text-on-surface">{word.englishWord}</p>
                          <p className="text-on-surface-variant text-xs">
                            {word.meaning.length > 40
                              ? word.meaning.slice(0, 40) + "…"
                              : word.meaning}
                          </p>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${diff.cls}`}>
                            {diff.label}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex flex-wrap gap-1">
                            {tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            {tags.length > 3 && (
                              <span className="text-on-surface-variant text-xs">+{tags.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <p className="text-on-surface text-xs font-medium">{word.userName}</p>
                          <p className="text-on-surface-variant text-xs">{word.userEmail}</p>
                        </td>
                        <td className="py-3 pr-4 text-on-surface-variant text-xs">
                          {new Date(word.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => handleDelete(word)}
                            className="p-1.5 rounded-xl text-on-surface-variant hover:bg-error-container/30 hover:text-error transition-colors"
                            title="Delete word"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-3">
              {data.items.map((word) => {
                const diff = diffLabel(word.difficultyLevel);
                const tags = word.tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean);
                return (
                  <div key={word.id} className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-on-surface">{word.englishWord}</p>
                        <p className="text-on-surface-variant text-sm">
                          {word.meaning.length > 50 ? word.meaning.slice(0, 50) + "…" : word.meaning}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${diff.cls}`}>
                        {diff.label}
                      </span>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-container-high">
                      <div>
                        <p className="text-on-surface text-xs font-medium">{word.userName}</p>
                        <p className="text-on-surface-variant text-xs">
                          {new Date(word.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(word)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-error-container/20 text-error text-xs font-semibold hover:bg-error-container/40 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-on-surface-variant">
            {data.total} words · page {data.page} of {data.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => startTransition(() => load(page - 1, search))}
              className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant text-sm font-semibold disabled:opacity-40 hover:bg-surface-container-high transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page >= data.totalPages}
              onClick={() => startTransition(() => load(page + 1, search))}
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
