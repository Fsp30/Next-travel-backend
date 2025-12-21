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

  findMany(options?: {
    skip?: number;
    take?: number;
    where?: {
      email?: string;
      name?: string;
    };
    orderBy?: {
      createdAt?: 'asc' | 'desc';
      lastLogin?: 'asc' | 'desc';
      name?: 'asc' | 'desc';
    };
  }): Promise<User[]>;
}
