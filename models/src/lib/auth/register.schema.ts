export class RegisterDto {
  email!: string;
  password!: string;
  name?: string;
}

import { z as zod } from 'zod';

export const RegisterSchema = zod.object({
  email: zod.email('Invalid email').trim().min(1, 'Email is required'),
  password: zod
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters long'),
  name: zod.string().optional(),
});

export type RegisterFormModel = zod.infer<typeof RegisterSchema>;
