"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { wordsApi, ApiClientError } from "@/lib/api-client";
import { useCoins } from "@/contexts/CoinContext";

interface Word {
  id: string;
  englishWord: string;
  meaning: string;
  exampleSentence: string | null;
  exampleSentenceTranslation?: string | null;
  difficultyLevel: number;
  tags: string;
}

interface GenerationError {
  type: "quota" | "coins" | "general";
  message: string;
}

export default function EditWordClient({ word }: { word: Word }) {
  const router = useRouter();
  const { updateCoins } = useCoins();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [justGenerated, setJustGenerated] = useState(false);
  const [generationError, setGenerationError] = useState<GenerationError | null>(null);

  useEffect(() => {
    if (!justGenerated) return;
    const t = setTimeout(() => setJustGenerated(false), 1000);
    return () => clearTimeout(t);
  }, [justGenerated]);
  const [coinBalance, setCoinBalance] = useState<number | null>(null);
  const [form, setForm] = useState({
    englishWord: word.englishWord,
    meaning: word.meaning,
    exampleSentence: word.exampleSentence ?? "",
    exampleSentenceTranslation: word.exampleSentenceTranslation ?? "",
    difficultyLevel: word.difficultyLevel,
    tags: word.tags,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.englishWord.trim() || !form.meaning.trim()) { toast.error("Word and meaning are required"); return; }
    setLoading(true);
    try {
      await wordsApi.update(word.id, {
        englishWord: form.englishWord,
        meaning: form.meaning,
        exampleSentence: form.exampleSentence,
        difficultyLevel: form.difficultyLevel,
        tags: form.tags,
      });
      toast.success("Word updated!");
      router.push("/words");
    } catch { toast.error("Failed to update"); }
    finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    const regenerate = !!form.exampleSentence;
    setGenerating(true);
    setGenerationError(null);
    try {
      const result = await wordsApi.generateExample(word.id, regenerate);
      if (result.generated && result.sentence) {
        setForm((f) => ({
          ...f,
          exampleSentence: result.sentence!,
          exampleSentenceTranslation: result.translation ?? "",
        }));
        if (result.remainingCoins !== undefined) {
          setCoinBalance(result.remainingCoins);
          updateCoins(result.remainingCoins);
        }
        setJustGenerated(true);
        toast.success("Sentence generated!");
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 429) {
          setGenerationError({ type: "quota", message: "AI quota exceeded. Please try again later." });
        } else if (err.status === 402) {
          setGenerationError({ type: "coins", message: "You don't have enough coins." });
        } else {
          setGenerationError({ type: "general", message: "Unable to generate a sentence. Please try again in a moment." });
        }
      } else {
        setGenerationError({ type: "general", message: "Unable to generate a sentence. Please try again in a moment." });
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="py-4 space-y-6 lg:py-0 lg:space-y-8 lg:max-w-4xl lg:mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/words" className="p-2 rounded-xl hover:bg-surface-container"><span className="material-symbols-outlined text-on-surface-variant">arrow_back</span></Link>
        <h1 className="font-headline text-2xl lg:text-4xl font-extrabold">Edit Word</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
        <div className="bg-surface-container-lowest rounded-3xl p-5 lg:p-7 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">English Word *</label>
            <input value={form.englishWord} onChange={(e) => setForm({ ...form, englishWord: e.target.value })} className="input-field" disabled={loading} />
          </div>
          <div className="lg:grid lg:grid-cols-2 lg:gap-5 space-y-4 lg:space-y-0">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Meaning *</label>
              <textarea value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} className="input-field resize-none" rows={3} disabled={loading} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold">Example Sentence</label>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating || loading}
                  className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 disabled:opacity-50 transition-colors"
                >
                  <span
                    className={`material-symbols-outlined text-[14px] ${generating ? "animate-sparkle" : ""}`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    auto_awesome
                  </span>
                  {generating ? "Generating..." : form.exampleSentence ? "Regenerate (10 coins)" : "Generate (10 coins)"}
                </button>
              </div>
              {generating ? (
                <div className="rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-4 h-[88px] flex flex-col items-center justify-between">
                  <div className="flex items-center gap-4 pt-1">
                    {([0, 0.18, 0.36] as number[]).map((delay, i) => (
                      <span
                        key={i}
                        className="material-symbols-outlined text-primary text-[22px]"
                        style={{ fontVariationSettings: "'FILL' 1", animation: `bounce-dot 1s ${delay}s infinite` }}
                      >
                        auto_awesome
                      </span>
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-on-surface-variant tracking-wide">
                    Crafting your sentence...
                  </p>
                </div>
              ) : (
                <>
                  <textarea
                    value={form.exampleSentence}
                    onChange={(e) => setForm({ ...form, exampleSentence: e.target.value })}
                    className={`input-field resize-none ${justGenerated ? "animate-pop-in" : ""}`}
                    rows={3}
                    disabled={loading}
                  />
                  {form.exampleSentenceTranslation && (
                    <p
                      className={`mt-1.5 text-xs text-on-surface-variant italic px-1 ${justGenerated ? "animate-pop-in" : ""}`}
                      style={justGenerated ? { animationDelay: "0.1s" } : undefined}
                    >
                      {form.exampleSentenceTranslation}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Generation Error */}
          {generationError && (
            <div className="flex items-start gap-3 bg-error-container/20 border border-error/20 rounded-2xl p-4">
              <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">warning</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-error">Unable to generate sentence</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{generationError.message}</p>
                {generationError.type === "coins" && (
                  <Link href="/store" className="text-xs font-bold text-primary mt-1 inline-block hover:underline">
                    Get more coins →
                  </Link>
                )}
              </div>
              <button type="button" onClick={() => setGenerationError(null)} className="p-1 rounded-lg hover:bg-error-container/30 transition-colors shrink-0">
                <span className="material-symbols-outlined text-[16px] text-error/60">close</span>
              </button>
            </div>
          )}
          {coinBalance !== null && (
            <p className="text-xs text-on-surface-variant">Remaining balance: <span className="font-bold text-tertiary">{coinBalance.toLocaleString()} coins</span></p>
          )}
        </div>

        <div className="lg:grid lg:grid-cols-5 lg:gap-5 space-y-4 lg:space-y-0">
          <div className="bg-surface-container-lowest rounded-3xl p-5 lg:p-6 space-y-3 lg:col-span-2">
            <label className="block text-sm font-semibold">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {[{v:1,l:"Easy",c:"bg-secondary-container text-on-secondary-container border-secondary"},{v:2,l:"Medium",c:"bg-tertiary-fixed text-tertiary border-tertiary"},{v:3,l:"Hard",c:"bg-error-container text-on-error-container border-error"}].map(({v,l,c})=>(
                <button key={v} type="button" onClick={()=>setForm({...form,difficultyLevel:v})} className={`py-2.5 lg:py-3 rounded-xl font-bold text-sm border-2 transition-all ${form.difficultyLevel===v?c:"border-transparent bg-surface-container-high text-on-surface-variant hover:bg-surface-container"}`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-3xl p-5 lg:p-6 lg:col-span-3">
            <label className="block text-sm font-semibold mb-1.5">Tags</label>
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="academic, IELTS..." className="input-field" disabled={loading} />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2 disabled:opacity-60 lg:max-w-md lg:mx-auto">
          {loading ? <><span className="material-symbols-outlined animate-spin">refresh</span>Saving...</> : <><span className="material-symbols-outlined">save</span>Save Changes</>}
        </button>
      </form>
    </div>
  );
}
