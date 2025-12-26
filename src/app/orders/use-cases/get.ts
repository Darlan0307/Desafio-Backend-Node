import { BaseUseCase } from "@shared/use-cases"
import { OrderData } from "../types"
import { GetEntityError, NotFoundError, UnprocessableEntityError } from "@infra/errors"
import { OrderRepository } from "../repository"
import { isValidObjectId } from "mongoose"

export class OrderGetUseCase extends BaseUseCase<string, OrderData, GetEntityError> {
  constructor(private orderRepository: OrderRepository) {
    super(GetEntityError, "Erro ao tentar buscar o pedido")
  }

  async action(
    orderId: string
  ): Promise<OrderData | NotFoundError | UnprocessableEntityError | GetEntityError> {
    if (!isValidObjectId(orderId)) {
      return new UnprocessableEntityError("ID do pedido inválido")
    }

    const orderExists = await this.orderRepository.get(orderId)

    if (!orderExists) {
      return new NotFoundError("Pedido não encontrado")
    }

    return orderExists
  }
}
