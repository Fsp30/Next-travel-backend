import { IUserRepository } from '../../interfaces';
import { BaseUseCase } from '../shared';

export interface DeleteUserInput {
  userId: string;
}

export interface DeleteUserOutput {
  success: boolean;
  message: string;
}

export class DeleteUserUseCase extends BaseUseCase<
  DeleteUserInput,
  DeleteUserOutput
> {
  constructor(private readonly userRepository: IUserRepository) {
    super();
  }

  async execute(input: DeleteUserInput): Promise<DeleteUserOutput> {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new Error(`User not found: ${input.userId}`);
    }

    await this.userRepository.delete(input.userId);

    return {
      success: true,
      message: 'User deletado com sucesso',
    };
  }
}
