import { beforeAll, describe, expect, it, vi } from "vitest"
import { CreateEntityError, InvalidInputError, NotFoundError } from "@infra/errors"
import { MockOrderRepository, OrderRepository } from "../repository"
import { MockUserRepository, UserRepository } from "@app/users/repository"
import { OrderCreateUseCase } from "./create"
import { OrderData, OrderServiceData } from "../types"
import { NewOrderData } from "../schema"
import { generateTestOrder, generateTestUser } from "@shared/test-unit"

type ResultCreate = OrderData | InvalidInputError | NotFoundError | CreateEntityError

describe("Order / Create Use Case", () => {
  let orderRepo: OrderRepository
  let userRepo: UserRepository
  let sut: OrderCreateUseCase

  const userId = "507f1f77bcf86cd799439012"

  beforeAll(() => {
    orderRepo = new MockOrderRepository()
    userRepo = new MockUserRepository()
    sut = new OrderCreateUseCase(userRepo, orderRepo)
  })

  describe("invalid input", () => {
    it.each([
      {
        lab: "ab",
        patient: "Patient",
        customer: "Customer",
        services: [{ name: "Svc", value: 10 }]
      },
      { lab: "Lab", patient: "ab", customer: "Customer", services: [{ name: "Svc", value: 10 }] },
      { lab: "Lab", patient: "Patient", customer: "ab", services: [{ name: "Svc", value: 10 }] },
      { lab: "Lab", patient: "Patient", customer: "Customer", services: [] },
      {
        lab: "Lab",
        patient: "Patient",
        customer: "Customer",
        services: [{ name: "ab", value: 10 }]
      },
      {
        lab: "Lab",
        patient: "Patient",
        customer: "Customer",
        services: [{ name: "Svc", value: 0 }]
      }
    ])("should return InvalidInputError when fields are invalid", async (input) => {
      const result: ResultCreate = await sut.execute(userId, input as NewOrderData)

      expect(result).toBeInstanceOf(InvalidInputError)
    })
  })

  describe("business rules", () => {
    it("should return NotFoundError when user does not exist", async () => {
      const input: NewOrderData = {
        lab: "Lab Test",
        patient: "Patient Test",
        customer: "Customer Test",
        services: [{ name: "Service", value: 100 }]
      }

      vi.spyOn(userRepo, "getById").mockResolvedValue(null)

      const result: ResultCreate = await sut.execute(userId, input)

      expect(result).toBeInstanceOf(NotFoundError)
    })
  })

  describe("valid input", () => {
    it("should create order with minimal payload", async () => {
      const input: NewOrderData = {
        lab: "Lab Test",
        patient: "Patient Test",
        customer: "Customer Test",
        services: [{ name: "Service", value: 100 }]
      }

      const orderCreated = generateTestOrder()

      vi.spyOn(userRepo, "getById").mockResolvedValue(generateTestUser())
      const spyCreate = vi.spyOn(orderRepo, "create").mockResolvedValue(orderCreated)

      const result: ResultCreate = await sut.execute(userId, input)

      expect(spyCreate).toHaveBeenCalledTimes(1)
      expect(spyCreate).toHaveBeenCalledWith(userId, input)
      expect(result).toEqual(orderCreated)
    })

    it("should create order with multiple services", async () => {
      const input: NewOrderData = {
        lab: "Lab Test",
        patient: "Patient Test",
        customer: "Customer Test",
        services: [
          { name: "Service 1", value: 50 },
          { name: "Service 2", value: 75 },
          { name: "Service 3", value: 25 }
        ]
      }

      const orderCreated = generateTestOrder({ services: input.services as OrderServiceData[] })

      vi.spyOn(userRepo, "getById").mockResolvedValue(generateTestUser())
      const spyCreate = vi.spyOn(orderRepo, "create").mockResolvedValue(orderCreated)

      const result: ResultCreate = await sut.execute(userId, input)

      expect(spyCreate).toHaveBeenCalledTimes(1)
      expect(result).not.toBeInstanceOf(InvalidInputError)
      expect(result).toEqual(orderCreated)
    })
  })
})
