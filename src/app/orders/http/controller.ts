import {
  created,
  createPaginationRequest,
  HttpRequest,
  HttpResponse,
  makeResponse,
  removeUndefinedFields
} from "@shared/http"
import {
  OrderCreateUseCase,
  OrderGetUseCase,
  OrderListUseCase,
  OrderPatchStateUseCase
} from "../use-cases"
import { OrderListQueries } from "../types"

export type UseCases = {
  create: OrderCreateUseCase
  list: OrderListUseCase
  get: OrderGetUseCase
  patchState: OrderPatchStateUseCase
}

export default class OrderHttpConrtoller {
  constructor(private useCases: UseCases) {}

  async create(request: HttpRequest): Promise<HttpResponse> {
    const userId = request?.userId ?? ""
    const input = removeUndefinedFields(request?.body ?? {})

    const result = await this.useCases.create.execute(userId, input)

    return makeResponse(result, created)
  }

  async patchState(request: HttpRequest): Promise<HttpResponse> {
    const orderId = request?.params?.id ?? ""
    const input = removeUndefinedFields(request?.body ?? {})

    const result = await this.useCases.patchState.execute(orderId, input)

    return makeResponse(result)
  }

  async get(request: HttpRequest): Promise<HttpResponse> {
    const orderId = request?.params?.id ?? ""

    const result = await this.useCases.get.execute(orderId)

    return makeResponse(result)
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
