import { z as zod } from 'zod';

export const UserProfileSchema = zod.object({
  avatarUrl: zod.string().nullable().optional(),
  createdAt: zod.string(),
  email: zod.string(),
  id: zod.string(),
  name: zod.string(),
});

export type UserProfileModel = zod.infer<typeof UserProfileSchema>;
