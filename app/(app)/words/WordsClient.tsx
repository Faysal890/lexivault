"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import clsx from "clsx";
import { wordsApi } from "@/lib/api-client";

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

async function exportToExcel(words: WordWithStats[]) {
  const { utils, writeFile } = await import("xlsx");
  const data = [
    ["Word", "Meaning", "Example", "Difficulty", "Tags", "Correct", "Wrong"],
    ...words.map(w => [
      w.englishWord,
      w.meaning,
      w.exampleSentence ?? "",
      DIFF_LABELS[w.difficultyLevel] ?? "",
      w.tags,
      w.wordStats?.correctCount ?? 0,
      w.wordStats?.wrongCount ?? 0,
    ]),
  ];
  const ws = utils.aoa_to_sheet(data);
  ws["!cols"] = [{ wch: 20 }, { wch: 30 }, { wch: 40 }, { wch: 12 }, { wch: 20 }, { wch: 10 }, { wch: 10 }];
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "My Words");
  writeFile(wb, "lexora-words.xlsx");
}

function exportToPDF(words: WordWithStats[]) {
  const rows = words.map(w => `
    <tr>
      <td>${escHtml(w.englishWord)}</td>
      <td>${escHtml(w.meaning)}</td>
      <td style="color:#555">${escHtml(w.exampleSentence ?? "")}</td>
      <td>${escHtml(DIFF_LABELS[w.difficultyLevel] ?? "")}</td>
      <td>${escHtml(w.tags)}</td>
      <td style="text-align:center">${w.wordStats?.correctCount ?? 0}</td>
      <td style="text-align:center">${w.wordStats?.wrongCount ?? 0}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Lexora — My Vocabulary</title>
    <style>
      @media print { body { margin: 0; } button { display: none; } }
      body { font-family: system-ui, sans-serif; font-size: 11pt; padding: 24px; }
      h1 { color: #4f46e5; margin-bottom: 4px; font-size: 18pt; }
      p { color: #666; margin-top: 0 0 16px; }
      table { border-collapse: collapse; width: 100%; }
      th { background: #4f46e5; color: #fff; padding: 6px 8px; text-align: left; font-size: 10pt; }
      td { padding: 5px 8px; border: 1px solid #ddd; font-size: 10pt; vertical-align: top; }
      tr:nth-child(even) td { background: #f9f9fb; }
    </style>
    </head><body>
    <h1>Lexora — My Vocabulary</h1>
    <p>Total: ${words.length} words</p>
    <table><thead><tr>
      <th>Word</th><th>Meaning</th><th>Example</th><th>Difficulty</th><th>Tags</th><th>Correct</th><th>Wrong</th>
    </tr></thead><tbody>${rows}</tbody></table>
    <script>window.onload = function(){ window.print(); }<\/script>
    </body></html>`;

  const win = window.open("", "_blank");
  if (!win) throw new Error("Popup blocked — please allow popups for this site");
  win.document.write(html);
  win.document.close();
}

function escHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function exportToWord(words: WordWithStats[]) {
  const rows = words.map(w => `
    <tr>
      <td style="padding:6px;border:1px solid #ddd;font-weight:bold">${escHtml(w.englishWord)}</td>
      <td style="padding:6px;border:1px solid #ddd">${escHtml(w.meaning)}</td>
      <td style="padding:6px;border:1px solid #ddd;color:#555">${escHtml(w.exampleSentence ?? "")}</td>
      <td style="padding:6px;border:1px solid #ddd">${escHtml(DIFF_LABELS[w.difficultyLevel] ?? "")}</td>
      <td style="padding:6px;border:1px solid #ddd">${escHtml(w.tags)}</td>
      <td style="padding:6px;border:1px solid #ddd;text-align:center">${w.wordStats?.correctCount ?? 0}</td>
      <td style="padding:6px;border:1px solid #ddd;text-align:center">${w.wordStats?.wrongCount ?? 0}</td>
    </tr>`).join("");

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
    <head><meta charset="utf-8">
    <style>body{font-family:Calibri,sans-serif;font-size:11pt} h1{color:#4f46e5} table{border-collapse:collapse;width:100%} th{background:#4f46e5;color:#fff;padding:6px 8px;border:1px solid #4f46e5;font-weight:bold}</style>
    </head>
    <body>
    <h1>Lexora — My Vocabulary</h1>
    <p style="color:#666">Total: ${words.length} words</p>
    <table>
      <thead><tr>
        <th>Word</th><th>Meaning</th><th>Example</th><th>Difficulty</th><th>Tags</th><th>Correct</th><th>Wrong</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    </body></html>`;

  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "lexora-words.doc";
  a.click();
  URL.revokeObjectURL(url);
}

export default function WordsClient({ initialWords, tags }: { initialWords: WordWithStats[]; tags: string[] }) {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [words, setWords] = useState(initialWords);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = words.filter((w) => {
    const matchesSearch = w.englishWord.toLowerCase().includes(search.toLowerCase()) ||
      w.meaning.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !selectedTag || w.tags.split(",").map(t => t.trim()).includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleExport = async (format: "excel" | "pdf" | "word") => {
    setExportOpen(false);
    setExporting(true);
    try {
      const wordsToExport = filtered;
      if (format === "excel") await exportToExcel(wordsToExport);
      else if (format === "pdf") await exportToPDF(wordsToExport);
      else exportToWord(wordsToExport);
      const label = format === "excel" ? "Excel" : format === "pdf" ? "PDF" : "Word";
      toast.success(`Exported ${wordsToExport.length} word${wordsToExport.length !== 1 ? "s" : ""} as ${label}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this word?")) return;
    setDeleting(id);
    try {
      await wordsApi.remove(id);
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
    <div className="py-4 space-y-4 lg:py-0 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl lg:text-4xl font-extrabold text-on-surface">My Words</h1>
          <p className="hidden lg:block text-on-surface-variant text-sm mt-1">Search, filter and export your vocabulary collection.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Export Dropdown */}
          {words.length > 0 && (
            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setExportOpen(v => !v)}
                disabled={exporting}
                className="flex items-center gap-1.5 bg-surface-container-high text-on-surface px-3 lg:px-4 py-2 lg:py-2.5 rounded-2xl text-sm font-bold active:scale-95 transition-transform hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-base">{exporting ? "hourglass_empty" : "download"}</span>
                <span className="hidden sm:inline">Export</span>
              </button>
              {exportOpen && (
                <div className="absolute right-0 top-full mt-1 bg-surface-container-lowest rounded-2xl shadow-lg border border-surface-container-high z-50 min-w-[160px] overflow-hidden">
                  <button onClick={() => handleExport("excel")} className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-surface-container transition-colors text-on-surface">
                    <span className="material-symbols-outlined text-base text-secondary">table_view</span> Excel (.xlsx)
                  </button>
                  <button onClick={() => handleExport("pdf")} className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-surface-container transition-colors text-on-surface border-t border-surface-container-high">
                    <span className="material-symbols-outlined text-base text-error">picture_as_pdf</span> PDF
                  </button>
                  <button onClick={() => handleExport("word")} className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-surface-container transition-colors text-on-surface border-t border-surface-container-high">
                    <span className="material-symbols-outlined text-base text-primary">description</span> Word (.doc)
                  </button>
                </div>
              )}
            </div>
          )}
          <Link href="/words/add" className="flex items-center gap-1.5 bg-gradient-primary text-on-primary px-4 lg:px-5 py-2 lg:py-2.5 rounded-2xl text-sm font-bold shadow-sm shadow-primary/20 active:scale-95 transition-transform hover:shadow-md">
            <span className="material-symbols-outlined text-base">add</span> <span className="hidden sm:inline">Add Word</span><span className="sm:hidden">Add</span>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="space-y-3 lg:bg-surface-container-lowest lg:rounded-3xl lg:p-5 lg:space-y-4 lg:shadow-sm">
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
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide lg:flex-wrap lg:overflow-visible">
            <button
              onClick={() => setSelectedTag("")}
              className={clsx("px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors", !selectedTag ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container")}
            >
              All
            </button>
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(t === selectedTag ? "" : t)}
                className={clsx("px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors", selectedTag === t ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container")}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Count */}
      <p className="text-xs text-on-surface-variant font-medium px-1">{filtered.length} word{filtered.length !== 1 ? "s" : ""}</p>

      {/* Words List */}
      {filtered.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-10 lg:p-16 text-center">
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
        <div className="space-y-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:space-y-0">
          {filtered.map((w) => (
            <div key={w.id} className="bg-surface-container-lowest rounded-2xl p-4 lg:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-headline font-bold text-on-surface lg:text-lg">{w.englishWord}</h3>
                    <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full", DIFF_COLORS[w.difficultyLevel])}>
                      {DIFF_LABELS[w.difficultyLevel]}
                    </span>
                    {(w.wordStats?.correctCount ?? 0) >= 3 && (
                      <span className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    )}
                  </div>
                  <p className="text-on-surface-variant text-sm mt-0.5 italic">{w.meaning}</p>
                  {w.exampleSentence && (
                    <div className="mt-3 pt-3 border-t border-surface-container-high">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wide">Example</span>
                      </div>
                      <p className="text-xs text-on-surface-variant italic leading-relaxed">&ldquo;{w.exampleSentence}&rdquo;</p>
                    </div>
                  )}
                  {w.tags && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {w.tags.split(",").map(t => t.trim()).filter(Boolean).map(t => (
                        <span key={t} className="text-[10px] bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant font-medium">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-2 shrink-0">
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
                <div className="flex gap-3 mt-auto pt-2 border-t border-surface-container-high">
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
