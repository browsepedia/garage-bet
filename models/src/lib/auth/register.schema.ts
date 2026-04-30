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
  name: zod.string().min(1, 'Display Name is required'),
  deviceId: zod.string().optional(),
});

export const RegisterFormSchema = zod
  .object({
    email: zod
      .string()
      .email('Invalid email')
      .trim()
      .min(1, 'Email is required'),
    password: zod
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters long'),
    confirmPassword: zod
      .string()
      .min(1, 'Confirm Password is required')
      .min(8, 'Confirm Password must be at least 8 characters long'),
    name: zod.string().min(1, 'Display Name is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'], // Sets the error on the confirmPassword field
  });

export type RegisterModel = zod.infer<typeof RegisterSchema>;
export type RegisterFormModel = zod.infer<typeof RegisterFormSchema>;

/** Device-only account: one device per user; optional display name. */
export const DeviceRegisterSchema = zod.object({
  deviceId: zod.string().min(1, 'Device ID is required'),
  name: zod.string().optional(),
});

export type DeviceRegisterFormModel = zod.infer<typeof DeviceRegisterSchema>;
