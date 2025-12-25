import { Router, Request, Response } from "express"
import { MongooseUserRepository } from "../repository"
import { PasswordService } from "@infra/service/password-service"
import { TokenService } from "@infra/service/token-service"
import { UserLoginUseCase, UserRegisterUseCase } from "../use-cases"
import UserHttpConrtoller from "./controller"

export async function createUsersRoutes(
  router: Router,
  passwordService: PasswordService,
  tokenService: TokenService
) {
  const userRepository = new MongooseUserRepository(passwordService, tokenService)

  const controller = new UserHttpConrtoller({
    register: new UserRegisterUseCase(userRepository),
    login: new UserLoginUseCase(userRepository)
  })

  router.post("/auth/register", async (req: Request, res: Response) => {
    const httpResponse = await controller.register(req)
    res.status(httpResponse.statusCode).json(httpResponse.body)
  })

  router.post("/auth/login", async (req: Request, res: Response) => {
    const httpResponse = await controller.login(req)
    res.status(httpResponse.statusCode).json(httpResponse.body)
  })
}
