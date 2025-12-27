import { OrderData, OrderState, OrderStatus, ServiceStatus } from "@app/orders/types"
import { UserData } from "@app/users/types"

export const generateTestOrder = (overrides?: Partial<OrderData>): OrderData => {
  return {
    id: "507f1f77bcf86cd799439011",
    lab: "Lab Test",
    patient: "Patient Test",
    customer: "Customer Test",
    state: OrderState.CREATED,
    status: OrderStatus.ACTIVE,
    services: [
      {
        name: "Service Test",
        value: 100,
        status: ServiceStatus.PENDING
      }
    ],
    user: {
      id: "507f1f77bcf86cd799439012",
      email: "test@test.com"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

export const generateTestUser = (overrides?: Partial<UserData>): UserData => ({
  id: "507f1f77bcf86cd799439012",
  email: "test@test.com",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
})
