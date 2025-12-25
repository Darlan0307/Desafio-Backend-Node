import z from "zod"

export const RegisterSchema = z.object({
  email: z.email({ message: "Email inválido" }),
  password: z.string().min(8, { message: "Senha deve ter no mínimo 8 caracteres" })
})

export const LoginSchema = z.object({
  email: z.email({ message: "Email inválido" }),
  password: z.string().min(8, { message: "Senha deve ter no mínimo 8 caracteres" })
})

export type UserRegisterData = z.infer<typeof RegisterSchema>

export type UserLoginData = z.infer<typeof LoginSchema>
