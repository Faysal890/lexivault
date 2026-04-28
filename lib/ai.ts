const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

export async function generateExampleSentence(word: string, meaning: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "";

  const prompt = `Generate one clear, natural English sentence that demonstrates the correct usage of the word "${word}" (meaning: ${meaning}). The sentence should be suitable for a language learner. Return only the sentence, no explanation, no quotes.`;

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
      return "";
    }
    const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return raw.trim().replace(/^["""''']+|["""''']+$/g, "");
  } catch (err) {
    if (err instanceof Error && err.message === "QUOTA_EXCEEDED") throw err;
    console.error("[ai] fetch error:", err);
    return "";
  }
}
