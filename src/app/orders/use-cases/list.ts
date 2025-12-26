import { BaseUseCase } from "@shared/use-cases"
import { OrderData, OrderListQueries } from "../types"
import { ListEntityError, NotFoundError } from "@infra/errors"
import { UserRepository } from "@app/users/repository"
import { OrderRepository } from "../repository"
import { DataListResponse } from "src/@types/global-types"

export class OrderListUseCase extends BaseUseCase<
  OrderListQueries,
  DataListResponse<OrderData>,
  ListEntityError
> {
  constructor(
    private userRepository: UserRepository,
    private orderRepository: OrderRepository
  ) {
    super(ListEntityError, "Erro ao tentar listar os pedidos")
  }

  async action(
    data: OrderListQueries
  ): Promise<DataListResponse<OrderData> | NotFoundError | ListEntityError> {
    const userExists = await this.userRepository.getById(data.filters.userId)

    if (!userExists) {
      return new NotFoundError("Usuário não encontrado")
    }

    return this.orderRepository.list(data)
  }
}
