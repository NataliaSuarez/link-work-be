export interface JwtPayload {
  email: string;
  role: number;
  sub: string;
  iat?: number;
}
