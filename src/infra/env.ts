import { z } from "zod"

const envSchema = z.object({
  MONGODB_URI: z.string({ error: "MONGODB_URI deve ser uma URL válida" }),
  PORT: z
    .string()
    .default("3000")
    .transform((port) => Number(port)),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info")
})

type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    console.error("❌ Variáveis de ambiente inválidas:")
    console.error(result.error.format())
    process.exit(1)
  }

  return result.data
}

export const env = validateEnv()
