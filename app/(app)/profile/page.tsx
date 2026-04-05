import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { id: true, name: true, email: true, nativeLanguage: true, dailyGoal: true, createdAt: true },
  });
  const streak = await prisma.streak.findUnique({ where: { userId: session!.user.id } });
  return <ProfileClient user={user!} streak={streak} />;
}
