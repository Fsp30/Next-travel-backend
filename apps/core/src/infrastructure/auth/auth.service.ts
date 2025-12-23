import { OAuth2Client } from 'google-auth-library';
import jwt, { SignOptions } from 'jsonwebtoken';
import { StringValue } from 'ms';
import {
  AuthTokens,
  GoogleUserInfo,
  IAuthService,
  IUserRepository,
  TokenPayload,
} from '../../interfaces';
import { User } from '../../domain/entities/User';

export class AuthService implements IAuthService {
  private client: OAuth2Client;
  private accessSecret: string;
  private refreshSecret: string;
  private accessExpiresIn: StringValue;
  private refreshExpiresIn: StringValue;

  constructor(private userRepository: IUserRepository) {
    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    this.accessSecret = process.env.JWT_ACCESS_SECRET!;
    this.refreshSecret = process.env.JWT_REFRESH_SECRET!;
    this.accessExpiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ||
      '1h') as StringValue;
    this.refreshExpiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ||
      '7d') as StringValue;

    if (!this.accessSecret || !this.refreshSecret) {
      throw new Error('JWT secret não configurada');
    }
  }

  async verifyGoogleToken(token: string): Promise<GoogleUserInfo> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new Error('Google token payload inválido');
      }

      return {
        sub: payload.sub,
        email: payload.email!,
        name: payload.name!,
        picture: payload.picture,
        email_verified: payload.email_verified || false,
      };
    } catch (error) {
      throw new Error(`Verificação de Google Token falhou: ${error}`);
    }
  }

  async generateAccessToken(user: User): Promise<string> {
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

  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        this.refreshSecret
      ) as TokenPayload;

      const user = await this.userRepository.findById(decoded.userId);

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const newAccessToken = await this.generateAccessToken(user);
      const newRefreshToken = await this.generateRefreshToken(user);

      const expiresIn = parseInt(this.accessExpiresIn);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: expiresIn,
      };
    } catch (error) {
      throw new Error(`Erro ao renovar token: ${error}`);
    }
  }

  async generateRefreshToken(user: User): Promise<string> {
    const payload = {
      userId: user.id.toString(),
    };

    const options: SignOptions = {
      expiresIn: this.refreshExpiresIn,
      subject: user.id.toString(),
    };

    return jwt.sign(payload, this.refreshSecret, options);
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, this.accessSecret) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new Error(
        `Refresh Token inválido ou expirado: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async verifyRefreshToken(token: string): Promise<{ userId: string }> {
    try {
      const decoded = jwt.verify(token, this.refreshSecret) as {
        userId: string;
      };
      return decoded;
    } catch (error) {
      throw new Error(
        `Refresh Token inválido ou expirado: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
