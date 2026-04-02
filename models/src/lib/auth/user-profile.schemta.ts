import { z as zod } from 'zod';

export const UserProfileSchema = zod.object({
  avatarUrl: zod.string().nullable().optional(),
  createdAt: zod.string(),
  email: zod.string().nullable(),
  id: zod.string(),
  name: zod.string().nullable().optional(),
  isAdmin: zod.boolean(),
});

export type UserProfileModel = zod.infer<typeof UserProfileSchema>;
