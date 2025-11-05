import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { User } from '../../domain/entities/User';
import { TokenPayload } from '../../interfaces';

export class JWTService {
  private accessSecret: string;
  private refreshSecret: string;
  private accessExpiresIn: StringValue;
  private refreshExpiresIn: StringValue;

  constructor() {
    this.accessSecret = process.env.JWT_ACCESS_SECRET!;
    this.refreshSecret = process.env.JWT_REFRESH_SECRET!;
    this.accessExpiresIn = (process.env.JWT_ACCESS_EXPIRES_IN || '1h') as StringValue;
    this.refreshExpiresIn = (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as StringValue;

    if (!this.accessSecret || !this.refreshSecret) {
      throw new Error('JWT secret não configurada');
    }
  }

  generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id.toString(),
      email: user.email,
    };

    const options: SignOptions = {
      expiresIn: this.accessExpiresIn,
      subject: user.id.toString(),
    };

    return jwt.sign(payload, this.accessSecret, options);
  }

  generateRefreshToken(user: User): string {
    const payload = {
      userId: user.id.toString(),
    };

    const options: SignOptions = {
      expiresIn: this.refreshExpiresIn,
      subject: user.id.toString(),
    };

    return jwt.sign(payload, this.refreshSecret, options);
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.accessSecret) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  verifyRefreshToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, this.refreshSecret) as { userId: string };
      return decoded;
    } catch (error) {
      throw new Error('Refresh Token inválido ou expirado');
    }
  }
}