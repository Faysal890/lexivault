const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

export interface GeneratedExample {
  sentence: string;
  translation: string;
}

export async function generateExampleSentence(
  word: string,
  meaning: string,
  nativeLanguage: string,
  currentSentence?: string
): Promise<GeneratedExample> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { sentence: "", translation: "" };

  const regeneratePart = currentSentence
    ? `The current example sentence is: "${currentSentence}". Generate a DIFFERENT sentence that uses the word in a different context.`
    : "";

  const prompt = `Generate one clear, natural English sentence demonstrating the correct usage of the word "${word}" (meaning: ${meaning}). The sentence should be suitable for a language learner. ${regeneratePart}
Then translate that sentence into ${nativeLanguage}.
Return ONLY valid JSON with exactly two fields, no markdown, no explanation:
{"sentence":"...","translation":"..."}`;

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    const data = await res.json();
    if (!res.ok) {
      const isQuota = res.status === 429 || data?.error?.status === "RESOURCE_EXHAUSTED";
      console.error("[ai] Gemini error:", res.status, JSON.stringify(data).slice(0, 200));
      if (isQuota) throw new Error("QUOTA_EXCEEDED");
      return { sentence: "", translation: "" };
    }
    const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      sentence: (parsed.sentence ?? "").trim(),
      translation: (parsed.translation ?? "").trim(),
    };
  } catch (err) {
    if (err instanceof Error && err.message === "QUOTA_EXCEEDED") throw err;
    console.error("[ai] fetch error:", err);
    return { sentence: "", translation: "" };
  }
}
