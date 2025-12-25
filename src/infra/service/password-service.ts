import { logger } from "@infra/logger"
import bcrypt from "bcrypt"

export class PasswordService {
  constructor(private saltRounds: number) {}

  async hash(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.saltRounds)
    } catch (error) {
      logger.error("Erro ao criptografar senha: " + JSON.stringify(error, null, 2))
      throw new Error("Erro ao criptografar senha")
    }
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword)
    } catch (error) {
      logger.error("Erro ao comparar senha: " + JSON.stringify(error, null, 2))
      return false
    }
  }
}
