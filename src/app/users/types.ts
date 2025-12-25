export type UserLoginResponse = {
  user: {
    id: string
    email: string
    createdAt: string
    updatedAt: string
  }
  token: string
}

export type UserData = {
  id: string
  email: string
  createdAt: string
  updatedAt: string
}
