import { env } from "@infra/env"
import { logger } from "@infra/logger"
import mongoose from "mongoose"

const MONGODB_URI = env.MONGODB_URI

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI)

    mongoose.connection.on("error", (error) => {
      logger.error(`Erro na conexão MongoDB: ${JSON.stringify(error)}`)
    })
  } catch (error) {
    logger.error(`Falha ao conectar ao MongoDB: ${JSON.stringify(error)}`)
    process.exit(1)
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect()
    logger.info("MongoDB desconectado")
  } catch (error) {
    logger.error(`Erro ao desconectar MongoDB: ${JSON.stringify(error)}`)
  }
}
