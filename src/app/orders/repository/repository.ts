import { DataListResponse } from "src/@types/global-types"
import { NewOrderData } from "../schema"
import { OrderData, OrderListQueries } from "../types"

export interface OrderRepository {
  create(userId: string, data: NewOrderData): Promise<OrderData>
  list(queries: OrderListQueries): Promise<DataListResponse<OrderData>>
}
