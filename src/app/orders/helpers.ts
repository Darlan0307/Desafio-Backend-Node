import { QueryFilter } from "mongoose"
import { OrderFilters, OrderState, OrderStatus } from "./types"
import { IOrderDocument } from "@infra/models/order"

export const buildWhereCondition = (filters: OrderFilters): QueryFilter<IOrderDocument> => {
  const where: QueryFilter<IOrderDocument> = {}

  where.status = OrderStatus.ACTIVE

  if (filters.state && Object.values(OrderState).includes(filters.state)) {
    where.state = filters.state
  }

  return where
}
