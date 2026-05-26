import { z } from 'zod'

export const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
})

export type LoginBody = z.infer<typeof LoginBodySchema>
export type UserResponse = z.infer<typeof UserResponseSchema>
