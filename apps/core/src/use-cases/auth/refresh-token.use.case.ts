import { AuthTokens, IAuthService } from '../../interfaces';
import { BaseUseCase } from '../shared';

export interface RefreshTokenInput {
  refreshToken: string;
}

export type RefreshTokenOutput = AuthTokens;

export class RefreshTokenUseCase extends BaseUseCase<
  RefreshTokenInput,
  RefreshTokenOutput
> {
  constructor(private readonly authService: IAuthService) {
    super();
  }

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    if (!input.refreshToken || input.refreshToken.trim().length === 0) {
      throw new Error('Refresh token é necessário');
    }

    const tokens = await this.authService.refreshAccessToken(
      input.refreshToken
    );

    return tokens;
  }
}
