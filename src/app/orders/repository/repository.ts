import { DataListResponse } from "src/@types/global-types"
import { NewOrderData, OrderPatchStateData } from "../schema"
import { OrderData, OrderListQueries } from "../types"

export interface OrderRepository {
  create(userId: string, data: NewOrderData): Promise<OrderData>
  list(queries: OrderListQueries): Promise<DataListResponse<OrderData>>
  get(id: string): Promise<OrderData | null>
  updateState(id: string, data: OrderPatchStateData): Promise<OrderData>
}
