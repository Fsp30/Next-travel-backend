import { UserResponseDTO } from '../user/UserResponseDTO';

export interface AuthResponseDTO {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  user: UserResponseDTO;
  isNewUser: boolean;
}
