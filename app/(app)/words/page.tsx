import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import WordsClient from "./WordsClient";

export default async function WordsPage({ searchParams }: { searchParams: { q?: string; tag?: string } }) {
  const session = await getServerSession(authOptions);
  const q = searchParams.q ?? "";
  const tag = searchParams.tag ?? "";

  const words = await prisma.word.findMany({
    where: {
      userId: session!.user.id,
      ...(q ? { englishWord: { contains: q } } : {}),
      ...(tag ? { tags: { contains: tag } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { wordStats: true },
  });

  // Get all unique tags
  const allWords = await prisma.word.findMany({
    where: { userId: session!.user.id },
    select: { tags: true },
  });
  const tags: string[] = Array.from(new Set(allWords.flatMap((w: { tags: string }) => w.tags.split(",").map((t: string) => t.trim()).filter((x): x is string => Boolean(x)))));

  return <WordsClient initialWords={words} tags={tags} />;
}
