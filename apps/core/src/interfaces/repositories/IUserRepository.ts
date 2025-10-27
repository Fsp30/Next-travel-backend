import { User } from '../../domain/entities/User';
import { UserId } from '../../domain/value-objects';
import { CreateUserDTO } from '../../dtos';

export interface IUserRepository {
  create(data: CreateUserDTO): Promise<User>;

  findById(id: string | UserId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;

  update(user: User): Promise<User>;
  updateLastLogin(id: string | UserId): Promise<void>;

  delete(user: User): Promise<void>;

  existsByEmail(email: string): Promise<boolean>;
  existsByGoogleId(googleId: string): Promise<boolean>;

  findAll(
    page?: number,
    limit?: number
  ): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }>;
}
