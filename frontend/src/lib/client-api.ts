import { BaseApi } from "./base-api";

// client-api.ts
export class ClientApi extends BaseApi {
  private tokenKey: string;

  constructor(baseUrl: string, tokenKey: string = "access_token") {
    super(baseUrl);
    this.tokenKey = tokenKey;
  }

  protected getAccessToken(): string | null {
    if (typeof window === "undefined") {
      return null; // Server-side rendering
    }

    try {
      return localStorage.getItem(this.tokenKey);
    } catch (error) {
      console.warn("Failed to get token from localStorage:", error);
      return null;
    }
  }

  public setAccessToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  public clearAccessToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.tokenKey);
    }
  }
}

export const ClientApiHandler = new ClientApi(
  process.env.SERVER_BASE_URL || "http://localhost:3000/api"
);
