import {
  created,
  HttpRequest,
  HttpResponse,
  makeResponse,
  removeUndefinedFields
} from "@shared/http"
import { UserLoginUseCase, UserRegisterUseCase } from "../use-cases"

export type UseCases = {
  register: UserRegisterUseCase
  login: UserLoginUseCase
}

export default class UserHttpConrtoller {
  constructor(private useCases: UseCases) {}

  async register(request: HttpRequest): Promise<HttpResponse> {
    const input = removeUndefinedFields(request?.body ?? {})

    const result = await this.useCases.register.execute(input)

    return makeResponse(result, created)
  }

  async login(request: HttpRequest): Promise<HttpResponse> {
    const input = removeUndefinedFields(request?.body ?? {})

    const result = await this.useCases.login.execute(input)

    return makeResponse(result)
  }
}
