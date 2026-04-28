import { requireUserId } from "@/lib/server/auth";
import { wordService } from "@/lib/server/services/word.service";
import { notFound } from "next/navigation";
import { NotFoundError } from "@/lib/server/errors";
import EditWordClient from "./EditWordClient";

export default async function EditWordPage({ params }: { params: { id: string } }) {
  const userId = await requireUserId();
  try {
    const word = await wordService.get(userId, params.id);
    return <EditWordClient word={word} />;
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }
}
