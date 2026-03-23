export interface JwtPayload {
  sub: number;
  username: string;
  roleId: number;
  permissions: string[];
  iat?: number;
  exp?: number;
}
