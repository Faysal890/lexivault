"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AddWordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    englishWord: "",
    meaning: "",
    exampleSentence: "",
    difficultyLevel: 1,
    tags: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.englishWord.trim() || !form.meaning.trim()) {
      toast.error("Word and meaning are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Word added! 🎉");
      router.push("/words");
    } catch {
      toast.error("Failed to add word");
    } finally {
      setLoading(false);
    }
  };

  const speakWord = () => {
    if (!form.englishWord) return;
    const u = new SpeechSynthesisUtterance(form.englishWord);
    u.lang = "en-US";
    speechSynthesis.speak(u);
  };

  return (
    <div className="py-4 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/words" className="p-2 rounded-xl hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </Link>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Add New Word</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* English Word */}
        <div className="bg-surface-container-lowest rounded-3xl p-5 space-y-4">
          <h2 className="font-headline font-bold text-on-surface text-sm uppercase tracking-wider text-outline">Word Details</h2>
          <div>
            <label className="block text-sm font-semibold mb-1.5">English Word *</label>
            <div className="flex gap-2">
              <input
                value={form.englishWord}
                onChange={(e) => setForm({ ...form, englishWord: e.target.value })}
                placeholder="e.g. Ephemeral"
                className="input-field flex-1"
                disabled={loading}
              />
              <button
                type="button"
                onClick={speakWord}
                className="p-3 bg-surface-container-high rounded-xl hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-primary">volume_up</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Meaning (your language) *</label>
            <textarea
              value={form.meaning}
              onChange={(e) => setForm({ ...form, meaning: e.target.value })}
              placeholder="Type the meaning in your native language..."
              className="input-field resize-none"
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Example Sentence <span className="text-outline font-normal">(optional)</span></label>
            <textarea
              value={form.exampleSentence}
              onChange={(e) => setForm({ ...form, exampleSentence: e.target.value })}
              placeholder="e.g. The beauty of a sunset is ephemeral."
              className="input-field resize-none"
              rows={2}
              disabled={loading}
            />
          </div>
        </div>

        {/* Difficulty */}
        <div className="bg-surface-container-lowest rounded-3xl p-5 space-y-3">
          <h2 className="font-headline font-bold text-on-surface text-sm uppercase tracking-wider text-outline">Difficulty Level</h2>
          <div className="grid grid-cols-3 gap-2">
            {[{ v: 1, l: "Easy", c: "bg-secondary-container text-on-secondary-container border-secondary" },
              { v: 2, l: "Medium", c: "bg-tertiary-fixed text-tertiary border-tertiary" },
              { v: 3, l: "Hard", c: "bg-error-container text-on-error-container border-error" }].map(({ v, l, c }) => (
              <button
                key={v}
                type="button"
                onClick={() => setForm({ ...form, difficultyLevel: v })}
                className={`py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${form.difficultyLevel === v ? c : "border-transparent bg-surface-container-high text-on-surface-variant"}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-surface-container-lowest rounded-3xl p-5 space-y-3">
          <h2 className="font-headline font-bold text-on-surface text-sm uppercase tracking-wider text-outline">Tags <span className="font-normal">(optional)</span></h2>
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="e.g. academic, IELTS, business (comma separated)"
            className="input-field"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <><span className="material-symbols-outlined animate-spin">refresh</span> Saving...</>
          ) : (
            <><span className="material-symbols-outlined">add_circle</span> Add Word</>
          )}
        </button>
      </form>
    </div>
  );
}
