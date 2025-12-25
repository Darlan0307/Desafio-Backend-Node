import { BaseUseCase } from "@shared/use-cases"
import { RegisterSchema, UserRegisterData } from "../schema"
import { UserLoginResponse } from "../types"
import { ConflictEntityError, CreateEntityError } from "@infra/errors"
import { MongooseUserRepository } from "../repository"

export class UserRegisterUseCase extends BaseUseCase<
  UserRegisterData,
  UserLoginResponse,
  CreateEntityError
> {
  constructor(private repository: MongooseUserRepository) {
    super(CreateEntityError, "Erro ao criar usuário", RegisterSchema)
  }

  async action(
    data: UserRegisterData
  ): Promise<UserLoginResponse | CreateEntityError | ConflictEntityError> {
    const userExists = await this.repository.getByEmail(data.email)

    if (userExists) {
      return new ConflictEntityError("Email já cadastrado no sistema")
    }

    return this.repository.register(data)
  }
}
