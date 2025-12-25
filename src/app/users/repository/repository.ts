import { UserLoginData, UserRegisterData } from "../schema/user-schema"
import { UserData, UserLoginResponse } from "../types"

export interface UserRepository {
  register(data: UserRegisterData): Promise<UserLoginResponse>
  login(data: UserLoginData): Promise<UserLoginResponse | null>
  getByEmail(email: string): Promise<UserData | null>
}
