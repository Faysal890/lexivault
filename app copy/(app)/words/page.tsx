import { requireUserId } from "@/lib/server/auth";
import { wordService } from "@/lib/server/services/word.service";
import WordsClient from "./WordsClient";

export default async function WordsPage({ searchParams }: { searchParams: { q?: string; tag?: string } }) {
  const userId = await requireUserId();
  const q = searchParams.q ?? "";
  const tag = searchParams.tag ?? "";

  const [words, tags] = await Promise.all([
    wordService.list(userId, { q, tag }),
    wordService.listAllTags(userId),
  ]);

  return <WordsClient initialWords={words} tags={tags} />;
}
