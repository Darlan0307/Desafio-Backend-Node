import { BaseUseCase } from "@shared/use-cases"
import { OrderData, OrderListQueries, OrderState } from "../types"
import { ListEntityError, NotFoundError, UnprocessableEntityError } from "@infra/errors"
import { OrderRepository } from "../repository"
import { DataListResponse } from "src/@types/global-types"

export class OrderListUseCase extends BaseUseCase<
  OrderListQueries,
  DataListResponse<OrderData>,
  ListEntityError
> {
  constructor(private orderRepository: OrderRepository) {
    super(ListEntityError, "Erro ao tentar listar os pedidos")
  }

  async action(
    data: OrderListQueries
  ): Promise<
    DataListResponse<OrderData> | NotFoundError | UnprocessableEntityError | ListEntityError
  > {
    if (data.filters.state && !Object.values(OrderState).includes(data.filters.state)) {
      return new UnprocessableEntityError(
        "O filtro 'state' deve ser um dos seguintes valores: " +
          Object.values(OrderState).join(", ")
      )
    }

    return this.orderRepository.list(data)
  }
}
