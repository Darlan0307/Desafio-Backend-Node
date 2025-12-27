import { PasswordService } from "@infra/service/password-service"
import { UserLoginData, UserRegisterData } from "../schema/user-schema"
import { UserData, UserLoginResponse } from "../types"
import { UserRepository } from "./repository"
import { TokenService } from "@infra/service/token-service"
import { CreateEntityError, GetEntityError, LoginError } from "@infra/errors"
import { IUserDocument, User } from "@infra/models/user"

export class MongooseUserRepository implements UserRepository {
  constructor(
    private passwordService: PasswordService,
    private tokenService: TokenService
  ) {}

  async register(data: UserRegisterData): Promise<UserLoginResponse> {
    try {
      const passwordHash = await this.passwordService.hash(data.password)

      const newUser = await User.create({
        email: data.email,
        password: passwordHash
      })

      const token = this.tokenService.generateAccessToken(newUser._id.toString())

      return {
        user: this.mapToUserData(newUser),
        token
      }
    } catch (error) {
      throw new CreateEntityError("Erro ao criar o usuário: " + JSON.stringify(error))
    }
  }

  async login(data: UserLoginData): Promise<UserLoginResponse | null> {
    try {
      const user = await User.findOne({ email: data.email })

      if (!user) {
        return null
      }

      const isValidPassword = await this.passwordService.compare(data.password, user.password)

      if (!isValidPassword) {
        return null
      }

      const token = this.tokenService.generateAccessToken(user._id.toString())

      return {
        user: this.mapToUserData(user),
        token
      }
    } catch (error) {
      throw new LoginError("Erro ao logar o usuário: " + JSON.stringify(error))
    }
  }

  async getById(id: string): Promise<UserData | null> {
    try {
      const user = await User.findById(id)

      if (!user) {
        return null
      }

      return this.mapToUserData(user)
    } catch (error) {
      throw new GetEntityError("Erro ao obter o usuário: " + JSON.stringify(error))
    }
  }

  async getByEmail(email: string): Promise<UserData | null> {
    try {
      const user = await User.findOne({ email })

      if (!user) {
        return null
      }

      return this.mapToUserData(user)
    } catch (error) {
      throw new GetEntityError("Erro ao obter o usuário: " + JSON.stringify(error))
    }
  }

  private mapToUserData(user: IUserDocument): UserData {
    return {
      id: user._id.toString(),
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }
  }
}
