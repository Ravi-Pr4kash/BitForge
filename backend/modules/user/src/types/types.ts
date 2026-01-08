import { email, z } from 'zod'

export const signupSchema = z.object({
    name: z.string().min(6).min(14),
    email: z.email().min(6).max(14),
    password: z.string().min(6).max(20)
})

export const signinSchema = z.object({
    email: z.email().min(5).max(14),
    password: z.string().min(6).max(20)
})