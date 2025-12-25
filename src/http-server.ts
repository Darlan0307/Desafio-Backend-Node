import express, { Request, Response, Express, Router } from "express"
import cors from "cors"
import { logger } from "@infra/logger"
import { connectDatabase, disconnectDatabase } from "@infra/database/mongoose"
import { createUsersRoutes } from "@app/users/http"
import { TokenService } from "@infra/service/token-service"
import { PasswordService } from "@infra/service/password-service"
import { env } from "@infra/env"

export default class HttpServer {
  private app: Express
  private passwordService: PasswordService
  private tokenService: TokenService

  constructor() {
    this.app = express()
    this.passwordService = new PasswordService(env.PASSWORD_SALT_ROUNDS)
    this.tokenService = new TokenService(env.TOKEN_SECRET, env.TOKEN_EXPIRES_IN)
  }

  async createApp(): Promise<Express> {
    await connectDatabase()
    this.loadMiddlewares()
    this.loadRoutes()
    return this.app
  }

  async stop(): Promise<void> {
    logger.info("Stopping...")
    await disconnectDatabase()
  }

  private loadMiddlewares(): void {
    this.app.use(cors())

    this.app.use(express.json())
  }

  private loadRoutes(): void {
    this.app.get("/", async (_req: Request, res: Response) => {
      res.json({
        message: "API rodando..."
      })
    })

    this.app.get("/health", async (req: Request, res: Response) => {
      res.status(200).json({ message: "ok", timestamp: new Date().toISOString() })
    })

    const router = Router()
    this.app.use(router)

    createUsersRoutes(router, this.passwordService, this.tokenService)

    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: {
          code: "ENDPOINT_NOT_FOUND",
          message: "Endpoint not found",
          path: req.originalUrl
        }
      })
    })
  }
}
