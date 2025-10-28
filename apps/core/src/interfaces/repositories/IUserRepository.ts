import { User } from '../../domain/entities/User';
import { UserId } from '../../domain/value-objects';

export interface IUserRepository {
  create(user: User): Promise<User>;

  findById(id: string | UserId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;

  update(user: User): Promise<User>;

  delete(id: string | UserId): Promise<void>;

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
