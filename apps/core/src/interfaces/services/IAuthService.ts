import { User } from '../../domain/entities/User';

export interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verifield: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface IAuthService {
  verifyGoogleToken(token: string): Promise<GoogleUserInfo>;
  verifyAccessToken(token: string): Promise<{ userId: string; email: string }>;
  verifyRefreshToken(token: string): Promise<{ userId: string }>;

  generateAccessToken(user: User): Promise<string>;
  generateRefreshToken(user: User): Promise<string>;

  refresAccessToken(refreshToken: string): Promise<AuthTokens>;

  revokeTokens(userId: string): Promise<void>;

  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
}
