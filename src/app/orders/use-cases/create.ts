import { BaseUseCase } from "@shared/use-cases"
import { NewOrderData, OrderSchema } from "../schema"
import { OrderData } from "../types"
import { CreateEntityError, InvalidInputError, NotFoundError } from "@infra/errors"
import { UserRepository } from "@app/users/repository"
import { OrderRepository } from "../repository"

export class OrderCreateUseCase extends BaseUseCase<NewOrderData, OrderData, CreateEntityError> {
  constructor(
    private userRepository: UserRepository,
    private orderRepository: OrderRepository
  ) {
    super(CreateEntityError, "Erro ao tentar criar o pedido", OrderSchema)
  }

  async action(
    userId: string,
    data: NewOrderData
  ): Promise<OrderData | InvalidInputError | NotFoundError | CreateEntityError> {
    const amountAllServices = data.services.reduce((acc, service) => {
      return acc + service.value
    }, 0)

    if (amountAllServices <= 0) {
      return new InvalidInputError("Valor total dos serviços deve ser maior que 0")
    }

    const userExists = await this.userRepository.getById(userId)

    if (!userExists) {
      return new NotFoundError("Usuário não encontrado")
    }

    return this.orderRepository.create(userId, data)
  }
}
