import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditWordClient from "./EditWordClient";

export default async function EditWordPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const word = await prisma.word.findFirst({
    where: { id: params.id, userId: session!.user.id },
  });
  if (!word) notFound();
  return <EditWordClient word={word} />;
}
