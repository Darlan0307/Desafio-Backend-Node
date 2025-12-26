import { QueryFilter } from "mongoose"
import { IOrderDocument } from "@models/order"
import { OrderFilters, OrderState, OrderStatus } from "./types"

export const buildWhereCondition = (filters: OrderFilters): QueryFilter<IOrderDocument> => {
  const where: QueryFilter<IOrderDocument> = {}

  where.userId = filters.userId

  where.status = OrderStatus.ACTIVE

  if (filters.state && Object.values(OrderState).includes(filters.state)) {
    where.state = filters.state
  }

  return where
}
