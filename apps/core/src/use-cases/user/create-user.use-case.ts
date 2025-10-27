// src/core/use-cases/user/create-user.use-case.ts

import { BaseUseCase } from '../shared/base.use-case';
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../interfaces';
import { validateCreateUserDTO } from '../../dtos';
import { CreateUserDTO } from '../../dtos';
import { UserResponseDTO, mapUserToResponseDTO } from '../../dtos';

export type CreateUserInput = CreateUserDTO;

export interface CreateUserOutput {
  user: UserResponseDTO;
  isNewUser: boolean;
}

export class CreateUserUseCase extends BaseUseCase<
  CreateUserInput,
  CreateUserOutput
> {
  constructor(private readonly userRepository: IUserRepository) {
    super();
  }

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    const validatedData = validateCreateUserDTO(input);

    const existingUser =
      (await this.userRepository.findByEmail(validatedData.email)) ||
      (await this.userRepository.findByGoogleId(validatedData.googleId));

    if (existingUser) {
      return {
        user: this.toDTO(existingUser),
        isNewUser: false,
      };
    }

    const newUser = User.create({
      email: validatedData.email,
      name: validatedData.name,
      googleId: validatedData.googleId,
      profilePicture: validatedData.profilePicture || undefined,
    });

    const savedUser = await this.userRepository.create(newUser);

    return {
      user: this.toDTO(savedUser),
      isNewUser: true,
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
