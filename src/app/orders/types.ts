import { Types } from "mongoose"
import { PaginationRequest } from "src/@types/global-types"

export enum OrderState {
  CREATED = "CREATED",
  ANALYSIS = "ANALYSIS",
  COMPLETED = "COMPLETED"
}

export enum OrderStatus {
  ACTIVE = "ACTIVE",
  DELETED = "DELETED"
}

export enum ServiceStatus {
  PENDING = "PENDING",
  DONE = "DONE"
}

export type OrderData = {
  lab: string
  patient: string
  customer: string
  state: OrderState
  status: OrderStatus
  services: OrderServiceData[]
  user: {
    id: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export type OrderServiceData = {
  name: string
  value: number
  status: ServiceStatus
}

export type PopulatedUser = {
  _id: Types.ObjectId
  email: string
}

export type OrderDocumentPopulated = {
  _id: Types.ObjectId
  lab: string
  patient: string
  customer: string
  userId: PopulatedUser
  state: OrderState
  status: OrderStatus
  services: OrderServiceData[]
  createdAt: Date
  updatedAt: Date
}

export type OrderFilters = {
  state?: OrderState
}

export type OrderListQueries = {
  pagination: PaginationRequest
  filters: OrderFilters
}
