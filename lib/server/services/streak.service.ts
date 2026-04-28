import { streakRepo } from "../repositories/streak.repo";

const DAY_MS = 86_400_000;

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Records activity for the user and awards XP. Idempotent within a day:
 * - If they were already active today, the streak doesn't double-bump.
 * - If their last activity was yesterday, the streak increments by one.
 * - Otherwise (or first activity), the streak resets to 1.
 *
 * No-op if the user has no streak row (shouldn't happen after registration).
 */
export const streakService = {
  async addXp(userId: string, xpGain: number) {
    const streak = await streakRepo.findByUserId(userId);
    if (!streak) return null;

    const now = new Date();
    const today = startOfToday();
    const yesterday = new Date(today.getTime() - DAY_MS);
    const lastActivity = streak.lastActivity;

    let newDays = streak.currentDays;
    if (!lastActivity || lastActivity < yesterday) {
      newDays = 1;
    } else if (lastActivity >= yesterday && lastActivity < today) {
      newDays = streak.currentDays + 1;
    }

    const newXP = streak.totalXP + xpGain;
    const newLevel = Math.floor(newXP / 100) + 1;

    return streakRepo.update(userId, {
      currentDays: newDays,
      longestDays: Math.max(streak.longestDays, newDays),
      lastActivity: now,
      totalXP: newXP,
      level: newLevel,
    });
  },
};
