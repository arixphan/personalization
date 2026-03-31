import { AUTH_CONFIG } from "@personalization/shared";
import { BaseApi } from "./base-api";

// client-api.ts
export class ClientApi extends BaseApi {
  constructor(baseUrl: string) {
    super(baseUrl);
  }

  protected getAccessToken(): string | null {
    // We now rely solely on HttpOnly cookies.
    // BaseApi will send no Authorization header, and the backend will read from cookies.
    return null;
  }

  public setAccessToken(_token: string): void {
    // No-op: tokens are managed via HttpOnly cookies by the backend
  }

  public clearAccessToken(): void {
    // No-op: cookies should be cleared via a logout endpoint
  }
}

import { env } from "@/config/env";

export const ClientApiHandler = new ClientApi(
  env.nextPublicServerBaseUrl
);
