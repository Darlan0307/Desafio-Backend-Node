import { DataListResponse, PaginationRequest } from "src/@types/global-types"
import { NewOrderData } from "../schema"
import { OrderData } from "../types"
import { OrderFilters } from "../helpers"

export interface OrderRepository {
  create(userId: string, data: NewOrderData): Promise<OrderData>
  list(pagination: PaginationRequest, filters: OrderFilters): Promise<DataListResponse<OrderData>>
}
