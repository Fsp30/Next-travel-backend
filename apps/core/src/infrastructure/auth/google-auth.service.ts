import { OAuth2Client } from 'google-auth-library';
import { GoogleUserInfo } from '../../interfaces';

export class GoogleAuthService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
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
}
