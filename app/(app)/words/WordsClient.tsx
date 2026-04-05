"use client";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import clsx from "clsx";

interface WordWithStats {
  id: string;
  englishWord: string;
  meaning: string;
  exampleSentence: string | null;
  difficultyLevel: number;
  tags: string;
  createdAt: Date;
  wordStats: { correctCount: number; wrongCount: number } | null;
}

const DIFF_LABELS = ["", "Easy", "Medium", "Hard"];
const DIFF_COLORS = ["", "text-secondary bg-secondary-container", "text-tertiary bg-tertiary-fixed", "text-error bg-error-container"];

export default function WordsClient({ initialWords, tags }: { initialWords: WordWithStats[]; tags: string[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [words, setWords] = useState(initialWords);

  const filtered = words.filter((w) => {
    const matchesSearch = w.englishWord.toLowerCase().includes(search.toLowerCase()) ||
      w.meaning.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !selectedTag || w.tags.split(",").map(t => t.trim()).includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this word?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/words/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setWords((prev) => prev.filter((w) => w.id !== id));
      toast.success("Word deleted");
    } catch {
      toast.error("Failed to delete word");
    } finally {
      setDeleting(null);
    }
  };

  const speakWord = (word: string) => {
    const u = new SpeechSynthesisUtterance(word);
    u.lang = "en-US";
    speechSynthesis.speak(u);
  };

  return (
    <div className="py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">My Words</h1>
        <Link href="/words/add" className="flex items-center gap-1 bg-gradient-primary text-on-primary px-4 py-2 rounded-2xl text-sm font-bold shadow-sm shadow-primary/20 active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-base">add</span> Add
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search words..."
          className="input-field pl-10"
        />
      </div>

      {/* Tag Filter */}
      {tags.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedTag("")}
            className={clsx("px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors", !selectedTag ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant")}
          >
            All
          </button>
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t === selectedTag ? "" : t)}
              className={clsx("px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors", selectedTag === t ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant")}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Count */}
      <p className="text-xs text-on-surface-variant font-medium px-1">{filtered.length} word{filtered.length !== 1 ? "s" : ""}</p>

      {/* Words List */}
      {filtered.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-10 text-center">
          <span className="material-symbols-outlined text-5xl text-outline mb-3 block">search_off</span>
          <p className="text-on-surface-variant font-medium">
            {words.length === 0 ? "No words yet. Start building your vocabulary!" : "No words match your search."}
          </p>
          {words.length === 0 && (
            <Link href="/words/add" className="mt-4 inline-block bg-gradient-primary text-on-primary px-5 py-2.5 rounded-2xl text-sm font-bold">
              Add your first word
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((w) => (
            <div key={w.id} className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-headline font-bold text-on-surface">{w.englishWord}</h3>
                    <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full", DIFF_COLORS[w.difficultyLevel])}>
                      {DIFF_LABELS[w.difficultyLevel]}
                    </span>
                    {(w.wordStats?.correctCount ?? 0) >= 3 && (
                      <span className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    )}
                  </div>
                  <p className="text-on-surface-variant text-sm mt-0.5 italic">{w.meaning}</p>
                  {w.exampleSentence && (
                    <p className="text-xs text-outline mt-1">&ldquo;{w.exampleSentence}&rdquo;</p>
                  )}
                  {w.tags && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {w.tags.split(",").map(t => t.trim()).filter(Boolean).map(t => (
                        <span key={t} className="text-[10px] bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant font-medium">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button onClick={() => speakWord(w.englishWord)} className="p-2 rounded-xl hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-base text-outline">volume_up</span>
                  </button>
                  <Link href={`/words/${w.id}/edit`} className="p-2 rounded-xl hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-base text-outline">edit</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(w.id)}
                    disabled={deleting === w.id}
                    className="p-2 rounded-xl hover:bg-error-container/30 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-error/60">delete</span>
                  </button>
                </div>
              </div>
              {w.wordStats && (
                <div className="flex gap-3 mt-2 pt-2 border-t border-surface-container-high">
                  <span className="text-xs text-secondary font-semibold">✓ {w.wordStats.correctCount} correct</span>
                  <span className="text-xs text-error/70 font-semibold">✗ {w.wordStats.wrongCount} wrong</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
