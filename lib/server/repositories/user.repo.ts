import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const userRepo = {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  },

  async getProfile(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, nativeLanguage: true, dailyGoal: true, createdAt: true },
    });
  },

  async getSummary(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { name: true, dailyGoal: true },
    });
  },

  async updateProfile(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, nativeLanguage: true, dailyGoal: true, createdAt: true },
    });
  },

  async getPasswordHash(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { passwordHash: true },
    });
  },

  async updatePasswordHash(id: string, passwordHash: string) {
    return prisma.user.update({ where: { id }, data: { passwordHash } });
  },

  async createWithStreak(data: { name: string; email: string; passwordHash: string; nativeLanguage: string }) {
    return prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
        streak: { create: {} },
      },
    });
  },

  async markEmailVerified(id: string) {
    return prisma.user.update({ where: { id }, data: { emailVerified: new Date() } });
  },
};
