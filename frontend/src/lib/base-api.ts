// types.ts
export interface PaginatedMeta {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
  prev: number | null;
  next: number | null;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface ApiRequestOptions {
  headers?: HeadersInit;
  signal?: AbortSignal;
}


export type ApiResponse<T> = SuccessApiResponse<T> | FailureApiResponse<T>

export interface SuccessApiResponse<T> {
  status: number;
  data: T | null;
  error: null;
  responseHeaders?: Headers;
}

export interface FailureApiResponse<T> {
  status: number;
  error: string | null;
  data: T | null;
  responseHeaders?: Headers;
}

export function isSuccessApiResponse<T>(res: ApiResponse<T>): res is SuccessApiResponse<T>  {
  return "data" in res
}

export function isFailureApiResponse<T>(res: ApiResponse<T>): res is FailureApiResponse<T>  {
  return "error" in res
}

// base-api.ts
export abstract class BaseApi {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  protected abstract getAccessToken(): Promise<string | null> | string | null;

  protected async buildHeaders(
    customHeaders?: HeadersInit
  ): Promise<HeadersInit> {
    const headers = new Headers(customHeaders);

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const token = await this.getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  }

  protected buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith("/")
      ? endpoint.slice(1)
      : endpoint;
    return `${this.baseUrl}/${cleanEndpoint}`;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: any,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.buildHeaders(options?.headers);

      const response = await fetch(this.buildUrl(endpoint), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: options?.signal,
      });


      const contentType = response.headers.get("Content-Type");
      const isJson = contentType?.includes("application/json");
      const responseData = isJson ? await response.json() : null;

      if (!response.ok) {
        return {
          status: response.status,
          data: null,
          error: responseData?.message || response.statusText,
          responseHeaders: response.headers,
        };
      }

      return {
        status: response.status,
        data: responseData,
        error: null,
        responseHeaders: response.headers,
      };
    } catch (error: unknown) {
      return {
        status: 0,
        data: null,
        error: error instanceof Error ? error?.message : "Unknown error",
      };
    }
  }

  public get<T = any>(endpoint: string, options?: ApiRequestOptions) {
    return this.request<T>("GET", endpoint, undefined, options);
  }

  public post<T = any>(
    endpoint: string,
    data?: any,
    options?: ApiRequestOptions
  ) {
    return this.request<T>("POST", endpoint, data, options);
  }

  public put<T = any>(
    endpoint: string,
    data?: any,
    options?: ApiRequestOptions
  ) {
    return this.request<T>("PUT", endpoint, data, options);
  }

  public delete<T = any>(endpoint: string, options?: ApiRequestOptions) {
    return this.request<T>("DELETE", endpoint, undefined, options);
  }
}
