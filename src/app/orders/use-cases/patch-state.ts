import { BaseUseCase } from "@shared/use-cases"
import { OrderPatchStateData, OrderPatchStateSchema } from "../schema"
import { OrderData, OrderState } from "../types"
import {
  CreateEntityError,
  InvalidInputError,
  NotFoundError,
  UnprocessableEntityError,
  UpdateEntityError
} from "@infra/errors"
import { OrderRepository } from "../repository"
import { isValidObjectId } from "mongoose"

const STATE_FLOW: OrderState[] = [OrderState.CREATED, OrderState.ANALYSIS, OrderState.COMPLETED]

export class OrderPatchStateUseCase extends BaseUseCase<
  OrderPatchStateData,
  OrderData,
  UpdateEntityError
> {
  constructor(private orderRepository: OrderRepository) {
    super(CreateEntityError, "Erro ao tentar atualizar estado do pedido", OrderPatchStateSchema)
  }

  async action(
    orderId: string,
    data: OrderPatchStateData
  ): Promise<
    OrderData | InvalidInputError | NotFoundError | UnprocessableEntityError | CreateEntityError
  > {
    if (!isValidObjectId(orderId)) {
      return new UnprocessableEntityError("ID do pedido inválido")
    }

    const orderExists = await this.orderRepository.get(orderId)

    if (!orderExists) {
      return new NotFoundError("Pedido não encontrado")
    }

    if (orderExists.state === data.state) {
      return orderExists
    }

    const currentIndex = STATE_FLOW.indexOf(orderExists.state)
    const nextIndex = STATE_FLOW.indexOf(data.state)

    if (nextIndex < currentIndex) {
      return new InvalidInputError(
        "Não é permitido retroceder. Siga a ordem: CREATED -> ANALYSIS -> COMPLETED"
      )
    }

    if (nextIndex > currentIndex + 1) {
      return new InvalidInputError(
        "Não é permitido pular etapas. Siga a ordem: CREATED -> ANALYSIS -> COMPLETED"
      )
    }

    return this.orderRepository.updateState(orderId, data)
  }
}
