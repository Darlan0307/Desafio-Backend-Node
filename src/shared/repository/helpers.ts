import { PaginationRequest, PaginationResult } from "src/@types/global-types"

export const buildPagination = (paginationRequest: PaginationRequest): PaginationResult => {
  let page = Number(paginationRequest.page) || 1
  if (isNaN(page) || page < 1) {
    page = 1
  }

  let perPage = Number(paginationRequest.perPage) || 50
  if (isNaN(perPage) || perPage < 1) {
    perPage = 50
  }

  return {
    skip: (page - 1) * perPage,
    limit: perPage
  }
}
