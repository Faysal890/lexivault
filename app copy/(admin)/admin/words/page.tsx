import { requireAdminId } from "@/lib/server/auth";
import { adminService } from "@/lib/server/services/admin.service";
import WordsTableClient from "./WordsTableClient";

export default async function AdminWordsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; userId?: string };
}) {
  await requireAdminId();
  const query = {
    page:   Number(searchParams.page ?? 1),
    limit:  20,
    search: searchParams.search ?? "",
    userId: searchParams.userId ?? undefined,
  };
  const result = await adminService.listWords(query);
  return <WordsTableClient initialData={result} initialQuery={query} />;
}
