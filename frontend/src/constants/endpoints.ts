import { AUTH_CONFIG } from "@personalization/shared";

export enum AuthEndpoint {
  signIn = "auth/login",
  signUp = "user/register",
  logout = "auth/logout",
  refreshToken = "auth/refresh",
}
export const REFRESH_TOKEN_ENDPOINT = AUTH_CONFIG.PATHS.REFRESH_TOKEN;

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

export class TicketEndpointFactory extends EndpointFactory {
  constructor() {
    super("tickets");
  }
  public listByProject(projectId: number): string {
    return `${this.baseUrl}/project/${projectId}`;
  }
}

export const TicketEndpoint = new TicketEndpointFactory();

export class UserEndpointFactory extends EndpointFactory {
  constructor() {
    super("user");
  }
  public profile(): string {
    return `${this.baseUrl}/profile`;
  }
  public settings(): string {
    return `${this.baseUrl}/settings`;
  }
  public experience(): string {
    return `${this.baseUrl}/profile/experience`;
  }
  public education(): string {
    return `${this.baseUrl}/profile/education`;
  }
  public skills(): string {
    return `${this.baseUrl}/profile/skills`;
  }
}

export const UserEndpoint = new UserEndpointFactory();
