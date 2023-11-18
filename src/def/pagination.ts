export interface Pagination {
  page: number
}
// eslint-disable-next-line antfu/no-const-enum
export const enum Paginated {
  Count,
  Data,
}

export interface PaginatedResult<T> {
  [Paginated.Count]: number
  [Paginated.Data]: T[]
}
