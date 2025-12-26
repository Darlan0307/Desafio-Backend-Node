import { Router, Request, Response } from "express"
import { PasswordService } from "@infra/service/password-service"
import { TokenService } from "@infra/service/token-service"
import { MongooseUserRepository } from "@app/users/repository"
import { MongooseOrderRepository } from "../repository"
import OrderHttpConrtoller from "./controller"
import { OrderCreateUseCase, OrderListUseCase } from "../use-cases"

export async function createOrdersRoutes(
  router: Router,
  passwordService: PasswordService,
  tokenService: TokenService
) {
  const userRepository = new MongooseUserRepository(passwordService, tokenService)
  const orderRepository = new MongooseOrderRepository()

  const controller = new OrderHttpConrtoller({
    create: new OrderCreateUseCase(userRepository, orderRepository),
    list: new OrderListUseCase(orderRepository)
  })

  router.post("/orders", async (req: Request, res: Response) => {
    const httpResponse = await controller.create(req)
    res.status(httpResponse.statusCode).json(httpResponse.body)
  })

  router.get("/orders", async (req: Request, res: Response) => {
    const httpResponse = await controller.list(req)
    res.status(httpResponse.statusCode).json(httpResponse.body)
  })
}
