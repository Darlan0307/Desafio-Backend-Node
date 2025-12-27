import { UserLoginData, UserRegisterData } from "../schema"
import { UserData, UserLoginResponse } from "../types"
import { UserRepository } from "./repository"

export class MockUserRepository implements UserRepository {
  async register(data: UserRegisterData): Promise<UserLoginResponse> {
    throw new Error("Error on register: " + JSON.stringify(data))
  }

  async login(data: UserLoginData): Promise<UserLoginResponse> {
    throw new Error("Error on login: " + JSON.stringify(data))
  }

  async getById(id: string): Promise<UserData | null> {
    throw new Error("Error on getById: " + id)
  }

  async getByEmail(email: string): Promise<UserData | null> {
    throw new Error("Error on getByEmail: " + email)
  }
}
