"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

interface Word { id: string; englishWord: string; meaning: string; exampleSentence: string | null; difficultyLevel: number; tags: string; }

export default function EditWordClient({ word }: { word: Word }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    englishWord: word.englishWord,
    meaning: word.meaning,
    exampleSentence: word.exampleSentence ?? "",
    difficultyLevel: word.difficultyLevel,
    tags: word.tags,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.englishWord.trim() || !form.meaning.trim()) { toast.error("Word and meaning are required"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/words/${word.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Word updated!");
      router.push("/words");
    } catch { toast.error("Failed to update"); }
    finally { setLoading(false); }
  };

  return (
    <div className="py-4 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/words" className="p-2 rounded-xl hover:bg-surface-container"><span className="material-symbols-outlined text-on-surface-variant">arrow_back</span></Link>
        <h1 className="font-headline text-2xl font-extrabold">Edit Word</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-surface-container-lowest rounded-3xl p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">English Word *</label>
            <input value={form.englishWord} onChange={(e) => setForm({ ...form, englishWord: e.target.value })} className="input-field" disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Meaning *</label>
            <textarea value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} className="input-field resize-none" rows={3} disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Example Sentence</label>
            <textarea value={form.exampleSentence} onChange={(e) => setForm({ ...form, exampleSentence: e.target.value })} className="input-field resize-none" rows={2} disabled={loading} />
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-3xl p-5 space-y-3">
          <label className="block text-sm font-semibold">Difficulty</label>
          <div className="grid grid-cols-3 gap-2">
            {[{v:1,l:"Easy",c:"bg-secondary-container text-on-secondary-container border-secondary"},{v:2,l:"Medium",c:"bg-tertiary-fixed text-tertiary border-tertiary"},{v:3,l:"Hard",c:"bg-error-container text-on-error-container border-error"}].map(({v,l,c})=>(
              <button key={v} type="button" onClick={()=>setForm({...form,difficultyLevel:v})} className={`py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${form.difficultyLevel===v?c:"border-transparent bg-surface-container-high text-on-surface-variant"}`}>{l}</button>
            ))}
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-3xl p-5">
          <label className="block text-sm font-semibold mb-1.5">Tags</label>
          <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="academic, IELTS..." className="input-field" disabled={loading} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <><span className="material-symbols-outlined animate-spin">refresh</span>Saving...</> : <><span className="material-symbols-outlined">save</span>Save Changes</>}
        </button>
      </form>
    </div>
  );
}
