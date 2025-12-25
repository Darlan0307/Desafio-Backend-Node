/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserData } from "@app/users/types"

export interface HttpResponse {
  success: boolean
  statusCode: number
  body: any
}

export interface HttpRequest {
  headers?: any
  params?: any
  query?: any
  body?: any
  userId?: string
  user?: UserData
}
