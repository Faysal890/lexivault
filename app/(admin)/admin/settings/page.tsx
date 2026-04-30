import { requireAdminId } from "@/lib/server/auth";
import { settingsService } from "@/lib/server/services/settings.service";
import { storeRepo } from "@/lib/server/repositories/store.repo";
import SettingsClient from "./SettingsClient";

export default async function AdminSettingsPage() {
  await requireAdminId();
  const [settings, packages] = await Promise.all([
    settingsService.getSettings(),
    storeRepo.listAllPackages(),
  ]);
  return <SettingsClient settings={settings} initialPackages={packages} />;
}
