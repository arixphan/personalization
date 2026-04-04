import { AUTH_CONFIG } from "@personalization/shared";
import { BaseApi } from "./base-api";
import { REFRESH_TOKEN_ENDPOINT } from "@/constants/endpoints";
import { toast } from "sonner";

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

  protected async onUnauthorized(): Promise<boolean> {
    try {
      // Attempt silent refresh
      const res = await fetch(REFRESH_TOKEN_ENDPOINT, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (!data.error) {
          return true; // Refresh successful, retry original request
        }
      }

      // Refresh failed or returned error - notify user
      toast.error("Your session has expired. Please sign in again.", {
        duration: Infinity,
        action: {
          label: "Sign In",
          onClick: () => (window.location.href = "/signin"),
        },
      });

      return false;
    } catch {
      return false;
    }
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
