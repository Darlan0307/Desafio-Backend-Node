import { beforeAll, describe, expect, it, vi } from "vitest"
import {
  CreateEntityError,
  InvalidInputError,
  NotFoundError,
  UnprocessableEntityError
} from "@infra/errors"
import { OrderPatchStateUseCase } from "./patch-state"
import { OrderData, OrderState } from "../types"
import { OrderPatchStateData } from "../schema"
import { MockOrderRepository, OrderRepository } from "../repository"
import { generateTestOrder } from "@shared/test-unit"

type ResultPatchState =
  | OrderData
  | InvalidInputError
  | NotFoundError
  | UnprocessableEntityError
  | CreateEntityError

describe("Order / Patch State Use Case", () => {
  let repo: OrderRepository
  let sut: OrderPatchStateUseCase

  const validOrderId = "507f1f77bcf86cd799439011"

  beforeAll(() => {
    repo = new MockOrderRepository()
    sut = new OrderPatchStateUseCase(repo)
  })

  describe("invalid input", () => {
    it.each([
      { state: "INVALID_STATE" },
      { state: "" },
      { state: "created" },
      { state: "PENDING" }
    ])("should return error when state is invalid", async (input) => {
      const result: ResultPatchState = await sut.execute(validOrderId, input as OrderPatchStateData)

      expect(result).toBeInstanceOf(InvalidInputError)
    })

    it("should return error when payload has extra properties", async () => {
      const input = {
        state: OrderState.ANALYSIS,
        extraField: "not allowed"
      }

      const result: ResultPatchState = await sut.execute(validOrderId, input as OrderPatchStateData)

      expect(result).toBeInstanceOf(InvalidInputError)
    })
  })

  describe("invalid order id", () => {
    it.each(["invalid-id", "123", "507f1f77bcf86cd79943901", "507f1f77bcf86cd7994390111"])(
      "should return UnprocessableEntityError when orderId is invalid",
      async (orderId) => {
        const input: OrderPatchStateData = { state: OrderState.ANALYSIS }

        const result: ResultPatchState = await sut.execute(orderId, input)

        expect(result).toBeInstanceOf(UnprocessableEntityError)
      }
    )
  })

  describe("order not found", () => {
    it("should return NotFoundError when order does not exist", async () => {
      const input: OrderPatchStateData = { state: OrderState.ANALYSIS }

      vi.spyOn(repo, "get").mockResolvedValue(null)

      const result: ResultPatchState = await sut.execute(validOrderId, input)

      expect(result).toBeInstanceOf(NotFoundError)
    })
  })

  describe("state transition rules", () => {
    it("should return the same order when state is unchanged", async () => {
      const existingOrder = generateTestOrder({ state: OrderState.CREATED })
      const input: OrderPatchStateData = { state: OrderState.CREATED }

      vi.spyOn(repo, "get").mockResolvedValue(existingOrder)
      const spyUpdate = vi.spyOn(repo, "updateState")

      const result: ResultPatchState = await sut.execute(validOrderId, input)

      expect(spyUpdate).not.toHaveBeenCalled()
      expect(result).toEqual(existingOrder)
    })

    it.each([
      { currentState: OrderState.ANALYSIS, newState: OrderState.CREATED },
      { currentState: OrderState.COMPLETED, newState: OrderState.ANALYSIS },
      { currentState: OrderState.COMPLETED, newState: OrderState.CREATED }
    ])(
      "should return InvalidInputError when trying to go back",
      async ({ currentState, newState }) => {
        const existingOrder = generateTestOrder({ state: currentState })
        const input: OrderPatchStateData = { state: newState }

        vi.spyOn(repo, "get").mockResolvedValue(existingOrder)

        const result: ResultPatchState = await sut.execute(validOrderId, input)

        expect(result).toBeInstanceOf(InvalidInputError)
        expect((result as InvalidInputError).message).toContain("retroceder")
      }
    )

    it("should return InvalidInputError when trying to skip steps: CREATED -> COMPLETED", async () => {
      const existingOrder = generateTestOrder({ state: OrderState.CREATED })
      const input: OrderPatchStateData = { state: OrderState.COMPLETED }

      vi.spyOn(repo, "get").mockResolvedValue(existingOrder)

      const result: ResultPatchState = await sut.execute(validOrderId, input)

      expect(result).toBeInstanceOf(InvalidInputError)
      expect((result as InvalidInputError).message).toContain("pular etapas")
    })
  })

  describe("valid state transitions", () => {
    it("should update state from CREATED to ANALYSIS", async () => {
      const existingOrder = generateTestOrder({ state: OrderState.CREATED })
      const updatedOrder = generateTestOrder({ state: OrderState.ANALYSIS })
      const input: OrderPatchStateData = { state: OrderState.ANALYSIS }

      vi.spyOn(repo, "get").mockResolvedValue(existingOrder)
      const spyUpdate = vi.spyOn(repo, "updateState").mockResolvedValue(updatedOrder)

      const result: ResultPatchState = await sut.execute(validOrderId, input)

      expect(spyUpdate).toHaveBeenCalledTimes(1)
      expect(spyUpdate).toHaveBeenCalledWith(validOrderId, input)
      expect(result).not.toBeInstanceOf(InvalidInputError)
      expect(result).not.toBeInstanceOf(NotFoundError)
      expect(result).toEqual(updatedOrder)
    })

    it("should update state from ANALYSIS to COMPLETED", async () => {
      const existingOrder = generateTestOrder({ state: OrderState.ANALYSIS })
      const updatedOrder = generateTestOrder({ state: OrderState.COMPLETED })
      const input: OrderPatchStateData = { state: OrderState.COMPLETED }

      vi.spyOn(repo, "get").mockResolvedValue(existingOrder)
      const spyUpdate = vi.spyOn(repo, "updateState").mockResolvedValue(updatedOrder)

      const result: ResultPatchState = await sut.execute(validOrderId, input)

      expect(spyUpdate).toHaveBeenCalledTimes(1)
      expect(spyUpdate).toHaveBeenCalledWith(validOrderId, input)
      expect(result).not.toBeInstanceOf(InvalidInputError)
      expect(result).not.toBeInstanceOf(NotFoundError)
      expect(result).toEqual(updatedOrder)
    })
  })
})
