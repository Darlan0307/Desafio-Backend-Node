import { z } from "zod"

const envSchema = z.object({
  MONGODB_URI: z.string({ error: "MONGODB_URI deve ser uma URL válida" }),
  PORT: z.string({ error: "PORT deve ser definido" }).transform((port) => Number(port)),
  NODE_ENV: z.enum(["development", "production", "test"], { error: "NODE_ENV deve ser definido" }),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"], { error: "LOG_LEVEL deve ser definido" }),
  PASSWORD_SALT_ROUNDS: z
    .string({ error: "PASSWORD_SALT_ROUNDS deve ser definido" })
    .transform((port) => Number(port)),
  TOKEN_SECRET: z.string({ error: "TOKEN_SECRET deve ser definido" }),
  TOKEN_EXPIRES_IN: z.string({ error: "TOKEN_EXPIRES_IN deve ser definido" })
})

type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    console.error("Variáveis de ambiente inválidas:")
    console.error(result.error.format())
    process.exit(1)
  }

  return result.data
}

export const env = validateEnv()
