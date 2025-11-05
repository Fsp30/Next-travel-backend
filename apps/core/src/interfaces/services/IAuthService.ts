import { User } from '../../domain/entities/User';

export interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface IAuthService {
  verifyGoogleToken(token: string): Promise<GoogleUserInfo>;

  generateAccessToken(user: User): Promise<string>;
  verifyAccessToken(token: string): Promise<TokenPayload>;

  generateRefreshToken(user: User): Promise<string>;
  verifyRefreshToken(token: string): Promise<{ userId: string }>;
  refreshAccessToken(refreshToken: string): Promise<AuthTokens>;

  revokeTokens(userId: string): Promise<void>;

  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
}
