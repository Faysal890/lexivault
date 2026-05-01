import { hashPassword, verifyPassword } from "@/lib/server/password";
import { BadRequestError, NotFoundError } from "../errors";
import { userRepo } from "../repositories/user.repo";
import type { ChangePasswordInput, ProfileDto, UpdateProfileInput } from "../dto/profile";

export const profileService = {
  async get(userId: string): Promise<ProfileDto> {
    const user = await userRepo.getProfile(userId);
    if (!user) throw new NotFoundError("User not found");
    return user;
  },

  async update(userId: string, input: UpdateProfileInput): Promise<ProfileDto> {
    return userRepo.updateProfile(userId, input);
  },

  async changePassword(userId: string, input: ChangePasswordInput) {
    const row = await userRepo.getPasswordHash(userId);
    if (!row) throw new NotFoundError("User not found");

    const matches = await verifyPassword(input.currentPassword, row.passwordHash);
    if (!matches) throw new BadRequestError("Current password is incorrect");

    const passwordHash = await hashPassword(input.newPassword);
    await userRepo.updatePasswordHash(userId, passwordHash);
  },
};
