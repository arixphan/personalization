import { cookies } from "next/headers";
import { AUTH_CONFIG } from "@personalization/shared";

import "server-only";

import { ApiRequestOptions, BaseApi } from "./base-api";
import { env } from "@/config/env.server";

export class ServerApi extends BaseApi {
  private tokenCookieName: string;

  constructor(baseUrl: string, tokenCookieName: string = AUTH_CONFIG.COOKIE_NAMES.ACCESS_TOKEN) {
    super(baseUrl);
    this.tokenCookieName = tokenCookieName;
  }

  protected async getAccessToken(): Promise<string | null> {
    try {
      const cookieStore = await cookies();
      const tokenCookie = cookieStore.get(this.tokenCookieName);
      return tokenCookie?.value || null;
    } catch {
      return null;
    }
  }

  protected onUnauthorized(): boolean {
    return false; // Server-side refresh is typically handled by middleware
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

export const ServerApiHandler = new ServerApi(env.serverBaseUrl);
