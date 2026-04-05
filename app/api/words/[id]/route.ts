import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  englishWord: z.string().min(1).max(100).trim().optional(),
  meaning: z.string().min(1).max(500).trim().optional(),
  exampleSentence: z.string().max(500).optional(),
  difficultyLevel: z.number().int().min(1).max(3).optional(),
  tags: z.string().max(200).optional(),
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const word = await prisma.word.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { wordStats: true },
  });
  if (!word) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(word);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const word = await prisma.word.findFirst({ where: { id: params.id, userId: session.user.id } });
    if (!word) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.word.update({
      where: { id: params.id },
      data: { ...data, exampleSentence: data.exampleSentence === "" ? null : data.exampleSentence },
    });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const word = await prisma.word.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!word) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.word.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
