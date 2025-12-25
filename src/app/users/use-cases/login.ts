import { BaseUseCase } from "@shared/use-cases"
import { LoginSchema, UserLoginData } from "../schema"
import { UserLoginResponse } from "../types"
import { LoginError, UnauthorizedActionError } from "@infra/errors"
import { MongooseUserRepository } from "../repository"

export class UserLoginUseCase extends BaseUseCase<UserLoginData, UserLoginResponse, LoginError> {
  constructor(private repository: MongooseUserRepository) {
    super(LoginError, "Erro ao tentar logar no sistema", LoginSchema)
  }

  async action(
    data: UserLoginData
  ): Promise<UserLoginResponse | LoginError | UnauthorizedActionError> {
    const userExistsAndValid = await this.repository.login(data)

    if (!userExistsAndValid) {
      return new UnauthorizedActionError("Email ou senha inválidos")
    }

    return userExistsAndValid
  }
}
