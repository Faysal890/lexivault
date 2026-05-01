import { prisma } from "@/lib/prisma";

const PUBLIC_FIELDS = {
  id: true,
  name: true,
  prefix: true,
  scopes: true,
  lastUsedAt: true,
  expiresAt: true,
  revokedAt: true,
  createdAt: true,
} as const;

export const apiKeyRepo = {
  async create(data: {
    userId: string;
    name: string;
    prefix: string;
    tokenHash: string;
    expiresAt: Date | null;
  }) {
    return prisma.apiKey.create({
      data,
      select: PUBLIC_FIELDS,
    });
  },

  async findByHash(tokenHash: string) {
    return prisma.apiKey.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        revokedAt: true,
        expiresAt: true,
        user: { select: { id: true, role: true } },
      },
    });
  },

  async listForUser(userId: string) {
    return prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: PUBLIC_FIELDS,
    });
  },

  async findByIdForUser(id: string, userId: string) {
    return prisma.apiKey.findFirst({
      where: { id, userId },
      select: PUBLIC_FIELDS,
    });
  },

  async revokeByIdForUser(id: string, userId: string) {
    return prisma.apiKey.updateMany({
      where: { id, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  async touchLastUsed(id: string) {
    return prisma.apiKey.update({
      where: { id },
      data: { lastUsedAt: new Date() },
      select: { id: true },
    });
  },
};
