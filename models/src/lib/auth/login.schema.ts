import { z as zod } from 'zod';

export const LoginSchema = zod.object({
  email: zod.email('Invalid email').trim().min(1, 'Email is required'),
  password: zod
    .string()
    .min(1, 'Password is required')
    .min(5, 'Password must be at least 5 characters long'),
});

export type LoginFormModel = zod.infer<typeof LoginSchema>;
