export enum AuthEndpoint {
  signIn = "user/register",
  singUp = "auth/login",
  logout = "auth/logout",
  refreshToken = "auth/refresh",
}
export const REFRESH_TOKEN_ENDPOINT = "/api/auth/refresh";

export class EndpointFactory {
  baseUrl: string;
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  public list(): string {
    return `${this.baseUrl}`;
  }
  public create(): string {
    return `${this.baseUrl}`;
  }
  public detail(id: string): string {
    return `${this.baseUrl}/${id}`;
  }
  public delete(id: string): string {
    return `${this.baseUrl}/${id}`;
  }
  public update(id: string): string {
    return `${this.baseUrl}/${id}`;
  }
}

export const ProjectEndpoint = new EndpointFactory("projects");
