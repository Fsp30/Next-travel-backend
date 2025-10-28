import { BaseUseCase } from '../shared';
import {
  AuthenticateUserDTO,
  AuthResponseDTO,
  mapUserToResponseDTO,
  validateAuthenticateUserDTO,
} from '../../dtos';
import { IUserRepository } from '../../interfaces';
import { IAuthService } from '../../interfaces/services/IAuthService';
import { User } from '../../domain/entities/User';

export type AuthenticateUserInput = AuthenticateUserDTO;
export type AuthenticateUserOutput = AuthResponseDTO;

export class AuthenticateUserUseCase extends BaseUseCase<
  AuthenticateUserInput,
  AuthenticateUserOutput
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authService: IAuthService
  ) {
    super();
  }

  async execute(input: AuthenticateUserInput): Promise<AuthenticateUserOutput> {
    const validatedData = validateAuthenticateUserDTO(input);

    const googleUser = await this.authService.verifyGoogleToken(
      validatedData.googleToken
    );

    let user = await this.userRepository.findByGoogleId(googleUser.sub);
    let isNewUser = false;

    if (!user) {
      user = User.create({
        email: googleUser.email,
        name: googleUser.name,
        googleId: googleUser.sub,
        ...(googleUser.picture && { profilePicture: googleUser.picture }),
      });

      user = await this.userRepository.create(user);
      isNewUser = true;
    }

    user.registerLogin();
    await this.userRepository.update(user);

    const accessToken = await this.authService.generateAccessToken(user);
    const refreshToken = await this.authService.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
      user: mapUserToResponseDTO({
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      }),
      isNewUser,
    };
  }
}
