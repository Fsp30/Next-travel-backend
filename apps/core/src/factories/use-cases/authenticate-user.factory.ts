import { IAuthService, IUserRepository } from '../../interfaces';
import { AuthenticateUserUseCase } from '../../use-cases/auth/authenticate-user.use-case';

export class AuthenticateUserFactory {
  static create(
    userRepostory: IUserRepository,
    authService: IAuthService
  ): AuthenticateUserUseCase {
    return new AuthenticateUserUseCase(userRepostory, authService);
  }
}
