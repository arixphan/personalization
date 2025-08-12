import { cookies } from "next/headers";

import "server-only";

import { ApiRequestOptions, BaseApi } from "./base-api";

export class ServerApi extends BaseApi {
  private tokenCookieName: string;

  constructor(baseUrl: string, tokenCookieName: string = "access_token") {
    super(baseUrl);
    this.tokenCookieName = tokenCookieName;
  }

  protected async getAccessToken(): Promise<string | null> {
    try {
      const cookieStore = await cookies();
      const tokenCookie = cookieStore.get(this.tokenCookieName);
      return tokenCookie?.value || null;
    } catch (error) {
      console.warn("Failed to get token from cookies:", error);
      return null;
    }
  }

  // Additional method to pass cookies manually if needed
  public async getWithCookies<T = any>(
    endpoint: string,
    cookieString: string,
    options?: ApiRequestOptions
  ): Promise<T> {
    const headers = await this.buildHeaders({
      ...options?.headers,
      Cookie: cookieString,
    });

    const response = await fetch(this.buildUrl(endpoint), {
      method: "GET",
      headers,
      signal: options?.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  protected buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith("/")
      ? endpoint.slice(1)
      : endpoint;
    return `${this.baseUrl}/${cleanEndpoint}`;
  }
}

export const ServerApiHandler = new ServerApi(
  process.env.SERVER_BASE_URL || "http://localhost:3000/api"
);
