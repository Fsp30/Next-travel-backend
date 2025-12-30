import { IUserRepository } from '@/core/src/interfaces';
import { UpdateUserUseCase } from '@/core/src/use-cases/user';

export class UdateUserFactory {
  static create(userRepository: IUserRepository): UpdateUserUseCase {
    return new UpdateUserUseCase(userRepository);
  }
}
