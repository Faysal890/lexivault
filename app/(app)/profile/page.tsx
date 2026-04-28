import { requireUserId } from "@/lib/server/auth";
import { profileService } from "@/lib/server/services/profile.service";
import { streakRepo } from "@/lib/server/repositories/streak.repo";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const userId = await requireUserId();
  const [user, streak] = await Promise.all([
    profileService.get(userId),
    streakRepo.findByUserId(userId),
  ]);
  return <ProfileClient user={user} streak={streak} />;
}
