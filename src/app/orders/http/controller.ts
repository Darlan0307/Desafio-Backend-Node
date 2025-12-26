import {
  created,
  createPaginationRequest,
  HttpRequest,
  HttpResponse,
  makeResponse,
  removeUndefinedFields
} from "@shared/http"
import { OrderCreateUseCase, OrderListUseCase } from "../use-cases"
import { OrderListQueries } from "../types"

export type UseCases = {
  create: OrderCreateUseCase
  list: OrderListUseCase
}

export default class OrderHttpConrtoller {
  constructor(private useCases: UseCases) {}

  async create(request: HttpRequest): Promise<HttpResponse> {
    const userId = request?.userId ?? ""
    const input = removeUndefinedFields(request?.body ?? {})

    const result = await this.useCases.create.execute(userId, input)

    return makeResponse(result, created)
  }

  async list(request: HttpRequest): Promise<HttpResponse> {
    const pagination = createPaginationRequest(request)

    const queries: OrderListQueries = {
      pagination,
      filters: {
        state: request?.query?.state
      }
    }

    const result = await this.useCases.list.execute(queries)

    return makeResponse(result)
  }
}
