import { requireAdminId } from "@/lib/server/auth";
import { adminService } from "@/lib/server/services/admin.service";
import UsersTableClient from "./UsersTableClient";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; role?: string };
}) {
  await requireAdminId();
  const query = {
    page:   Number(searchParams.page ?? 1),
    limit:  20,
    search: searchParams.search ?? "",
    role:   (searchParams.role as "USER" | "ADMIN" | undefined) ?? undefined,
  };
  const result = await adminService.listUsers(query);
  return <UsersTableClient initialData={result} initialQuery={query} />;
}
