import { IUserRepository } from '@/core/src/interfaces';
import { CreateUserUseCase } from '@/core/src/use-cases/user';

export class CreateUserFactory {
  static create(userRepository: IUserRepository): CreateUserUseCase {
    return new CreateUserUseCase(userRepository);
  }
}
