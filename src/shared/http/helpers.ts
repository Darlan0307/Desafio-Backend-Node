/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from "@infra/logger"
import {
  ConflictEntityError,
  CreateEntityError,
  GetEntityError,
  InvalidInputError,
  ListEntityError,
  NotFoundError,
  UnauthorizedActionError,
  UnprocessableEntityError,
  UpdateEntityError
} from "@infra/errors"
import { HttpRequest, HttpResponse } from "./http-response"
import { PaginationRequest } from "src/@types/global-types"

export const badRequest = (error: Error, data: unknown = null): HttpResponse => {
  if (!data) {
    return {
      success: false,
      statusCode: 400,
      body: { errorMessage: error.message }
    }
  }

  return {
    success: false,
    statusCode: 400,
    body: { errorMessage: error.message, data }
  }
}

export const notFound = (error?: Error): HttpResponse => ({
  success: false,
  statusCode: 404,
  body: { errorMessage: error?.message || "not found" }
})

export const ok = (data: unknown = {}): HttpResponse => ({
  success: true,
  statusCode: 200,
  body: data
})

export const created = (data: unknown = {}): HttpResponse => ({
  success: true,
  statusCode: 201,
  body: data
})

export const noContent = (): HttpResponse => ({
  success: true,
  body: {},
  statusCode: 204
})

export const serverError = (error: Error | unknown): HttpResponse => {
  if (error instanceof Error) {
    logger.error(error)
    return {
      success: false,
      statusCode: 500,
      body: { errorMessage: error.message }
    }
  }

  return {
    success: false,
    statusCode: 500,
    body: { errorMessage: "Problemas em processar a requisição pelo servidor" }
  }
}

export const unauthorized = (error: Error): HttpResponse => ({
  success: false,
  statusCode: 401,
  body: { errorMessage: error.message }
})

export const forbidden = (error?: Error): HttpResponse => ({
  success: false,
  statusCode: 403,
  body: { errorMessage: error?.message || "" }
})

export const conflict = (error?: Error): HttpResponse => ({
  success: false,
  statusCode: 409,
  body: { errorMessage: error?.message || "conflict" }
})

export const unprocessable = (error?: Error): HttpResponse => ({
  success: false,
  statusCode: 422,
  body: { errorMessage: error?.message || "unprocessable" }
})

export function removeUndefinedFields<T extends Record<string, any>>(input: T): T {
  if (!input) {
    return {} as T
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return Object.fromEntries(Object.entries(input).filter(([_, value]) => value !== undefined)) as T
}

export const createPaginationRequest = (req: HttpRequest): PaginationRequest => {
  let page = Number(req?.query?.page ?? 1)
  if (isNaN(page) || page < 1) {
    page = 1
  }

  let perPage = Number(req?.query?.perPage ?? 50)
  if (isNaN(perPage) || perPage < 1) {
    perPage = 50
  }

  return {
    page,
    perPage
  }
}

export function makeResponse(result: any, cb: (data?: any) => HttpResponse | null = ok): any {
  const errorMap = new Map([
    [NotFoundError, notFound],
    [InvalidInputError, badRequest],
    [ConflictEntityError, conflict],
    [UnauthorizedActionError, unauthorized],
    [UnprocessableEntityError, unprocessable],
    [UpdateEntityError, serverError],
    [CreateEntityError, serverError],
    [GetEntityError, serverError],
    [ListEntityError, serverError]
  ])

  for (const [ErrorType, responseFunc] of errorMap) {
    if (result instanceof ErrorType) {
      return responseFunc(result)
    }
  }

  return cb ? cb(result) : noContent()
}
