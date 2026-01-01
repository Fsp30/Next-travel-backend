import { IUserRepository } from '@/core/src/interfaces';
import { DeleteUserUseCase } from '@/core/src/use-cases/user';

export class DeleteUserFactory {
  static create(userRepository: IUserRepository): DeleteUserUseCase {
    return new DeleteUserUseCase(userRepository);
  }
}
