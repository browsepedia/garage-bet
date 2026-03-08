export class RegisterDto {
  email!: string;
  password!: string;
  name?: string;
  deviceId?: string;
}

import { z as zod } from 'zod';

export const RegisterSchema = zod.object({
  email: zod.email('Invalid email').trim().min(1, 'Email is required'),
  password: zod
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters long'),
  name: zod.string().optional(),
  deviceId: zod.string().optional(),
});

export type RegisterFormModel = zod.infer<typeof RegisterSchema>;

export const AnonymousRegisterSchema = zod.object({
  deviceId: zod.string().min(1, 'Device ID is required'),
  name: zod.string(),
});

export type AnonymousRegisterFormModel = zod.infer<
  typeof AnonymousRegisterSchema
>;
