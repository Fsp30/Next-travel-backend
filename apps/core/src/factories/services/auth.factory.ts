import { AuthService } from '../../infrastructure';
import { IAuthService, IUserRepository } from '../../interfaces';

export class AuthServiceFactory {
  static create(userRepository: IUserRepository): IAuthService {
    return new AuthService(userRepository);
  }
}
