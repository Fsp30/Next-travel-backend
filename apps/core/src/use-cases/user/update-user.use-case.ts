import { User } from '../../domain/entities/User';
import {
  mapUserToResponseDTO,
  UpdateUserDTO,
  UserResponseDTO,
  validateUpdateUserDTO,
} from '../../dtos';
import { IUserRepository } from '../../interfaces';
import { BaseUseCase } from '../shared';

export type UpdateUserInput = UpdateUserDTO;

export interface UpdateUserOutput {
  user: UserResponseDTO;
}

export class UpdateUserUseCase extends BaseUseCase<
  UpdateUserInput,
  UpdateUserOutput
> {
  constructor(private readonly userRepository: IUserRepository) {
    super();
  }

  async execute(input: UpdateUserInput): Promise<UpdateUserOutput> {
    const validatedData = validateUpdateUserDTO(input);

    const existingUser = await this.userRepository.findById(
      validatedData.userId
    );
    if (!existingUser) throw new Error('User not found');

    if (validatedData.name !== undefined) {
      existingUser.updateName(validatedData.name);
    }

    if (validatedData.profile) {
      existingUser.updateProfilePicture(validatedData.profile);
    }

    const updatedUser = await this.userRepository.update(existingUser);

    return {
      user: this.toDTO(updatedUser),
    };
  }

  private toDTO(user: User): UserResponseDTO {
    return mapUserToResponseDTO({
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    });
  }
}
