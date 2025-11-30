import { ApiResponse, PaginatedMeta } from "./base-api";

type ApiPaginatedResponse<T> = ApiResponse<T> & {
  meta: PaginatedMeta;
}

export interface PaginatedRequest {
  limit: number;
  page: number;
}

export function isPaginatedResponse<T>(response: ApiResponse<T>): response is ApiPaginatedResponse<T> {
  return "meta" in response;
} 