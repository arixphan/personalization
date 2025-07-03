export interface JwtPayload {
  sub: string;
  username: string;
  roleId: string;
  permissions: string[];
}
