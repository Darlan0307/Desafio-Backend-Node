import { DataListResponse } from "src/@types/global-types"
import { NewOrderData, OrderPatchStateData } from "../schema"
import { OrderData, OrderListQueries } from "../types"
import { OrderRepository } from "./repository"

export class MockOrderRepository implements OrderRepository {
  async create(userId: string, data: NewOrderData): Promise<OrderData> {
    throw new Error("Erro on save: " + JSON.stringify(userId + data))
  }

  async list(queries: OrderListQueries): Promise<DataListResponse<OrderData>> {
    throw new Error("Erro on list: " + JSON.stringify(queries))
  }

  async get(id: string): Promise<OrderData | null> {
    throw new Error("Erro on get: " + JSON.stringify(id))
  }

  async updateState(id: string, data: OrderPatchStateData): Promise<OrderData> {
    throw new Error("Erro on updateState: " + JSON.stringify(id + data))
  }
}
