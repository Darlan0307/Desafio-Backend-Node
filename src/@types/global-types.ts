export type PaginationRequest = {
  page: number
  perPage: number
}

export type PaginationResult = {
  skip: number
  limit: number
}

export type DataListResponse<T> = {
  data: T[]
  totalRecords: number
  totalPages: number
  perPage: number
  currentPage: number
}
