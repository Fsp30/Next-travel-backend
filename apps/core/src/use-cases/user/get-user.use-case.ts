import { User } from '../../domain/entities/User';
import {
  GetUserDTO,
  mapUserToResponseDTO,
  UserResponseDTO,
  validateGetUserDTO,
} from '../../dtos';
import { IUserRepository } from '../../interfaces';
import { BaseUseCase } from '../shared';

export type GetUserInput = GetUserDTO;

export interface GetUserOutput {
  user: UserResponseDTO;
}

export class GetUserUseCase extends BaseUseCase<GetUserInput, GetUserOutput> {
  constructor(private readonly userRepository: IUserRepository) {
    super();
  }

  async execute(input: GetUserInput): Promise<GetUserOutput> {
    const validatedData = validateGetUserDTO(input);
    const queries: Promise<User | null>[] = [];

    if (validatedData.id) {
      queries.push(this.userRepository.findById(validatedData.id));
    }
    if (validatedData.email) {
      queries.push(this.userRepository.findByEmail(validatedData.email));
    }
    if (validatedData.googleId) {
      queries.push(this.userRepository.findByGoogleId(validatedData.googleId));
    }

    if (queries.length === 0) {
      throw new Error('No valid search parameters provided');
    }

    const results = await Promise.all(queries);

    const user = results.find((u) => u !== null);

    if (!user) {
      throw new Error('User not found');
    }

    return {
      user: this.toDTO(user),
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
