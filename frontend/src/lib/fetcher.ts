class FetchWrapper {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public get(url: string): Promise<Response> {
    return fetch(`${this.baseUrl}\\${url}`);
  }

  public post(
    url: string,
    data: object,
    token?: string,
    cookies?: string
  ): Promise<Response> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (cookies) {
      headers.Cookie = cookies;
    }

    return fetch(`${this.baseUrl}\\${url}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
  }
}

export const Fetcher = new FetchWrapper(
  process.env.SERVER_BASE_URL || "http://localhost:3000/api"
);
