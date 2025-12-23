import { IAuthService } from '../../interfaces';
import { RefreshTokenUseCase } from '../../use-cases/auth/refresh-token.use.case';

export class RefreshTokenFactory {
  static create(authService: IAuthService): RefreshTokenUseCase {
    return new RefreshTokenUseCase(authService);
  }
}
