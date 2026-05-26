import { z } from 'zod'

export const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const RegisterBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  displayName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
})

export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
})

export type LoginBody = z.infer<typeof LoginBodySchema>
export type RegisterBody = z.infer<typeof RegisterBodySchema>
export type UserResponse = z.infer<typeof UserResponseSchema>
