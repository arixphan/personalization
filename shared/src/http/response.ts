


export interface ApiErrorResponse<T> {
  error: string;
  message?: string;
  data?: T | null;
}

export interface ApiSuccessResponse<T> {
  data: T | null;
}

export type ApiResponse<T> = ApiErrorResponse<T> | ApiSuccessResponse<T>;