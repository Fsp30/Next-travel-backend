import { IUserRepository } from '@/core/src/interfaces';
import { GetUserUseCase } from '../../../use-cases/user/get-user.use-case';

export class GetUserFactory {
  static create(userRepository: IUserRepository): GetUserUseCase {
    return new GetUserUseCase(userRepository);
  }
}
