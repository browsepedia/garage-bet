import { z as zod } from 'zod';

export const LoginResponseSchema = zod.object({
  accessToken: zod.string(),
  refreshToken: zod.string(),
});

export type LoginResponseModel = zod.infer<typeof LoginResponseSchema>;
