import { prisma } from "@/lib/prisma";

export const passwordResetTokenRepo = {
  async findByHash(tokenHash: string) {
    return prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true } } },
    });
  },

  async create(data: { userId: string; tokenHash: string; expiresAt: Date }) {
    return prisma.passwordResetToken.create({ data });
  },

  async invalidateActiveForUser(userId: string) {
    return prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });
  },

  async markUsedAndUpdatePassword(tokenId: string, userId: string, passwordHash: string) {
    return prisma.$transaction([
      prisma.passwordResetToken.update({
        where: { id: tokenId },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    ]);
  },
};

export const emailVerificationTokenRepo = {
  async findByHash(tokenHash: string) {
    return prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, emailVerified: true } } },
    });
  },

  async create(data: { userId: string; tokenHash: string; expiresAt: Date }) {
    return prisma.emailVerificationToken.create({ data });
  },

  async deleteAllForUser(userId: string) {
    return prisma.emailVerificationToken.deleteMany({ where: { userId } });
  },

  async markUsedAndVerify(tokenHash: string, userId: string) {
    return prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { emailVerified: new Date() } }),
      prisma.emailVerificationToken.update({ where: { tokenHash }, data: { usedAt: new Date() } }),
    ]);
  },
};
