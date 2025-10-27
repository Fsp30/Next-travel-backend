import { UserId } from '../value-objects/UserId';

export interface UserProps {
  id: UserId;
  email: string;
  name: string;
  googleId: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt?: Date;
  lastLogin?: Date;
}

export class User {
  private constructor(private props: UserProps) {
    this.validate();
  }

  static create(props: Omit<UserProps, 'id' | 'createdAt'>): User {
    return new User({
      ...props,
      id: UserId.create(),
      createdAt: new Date(),
    });
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  private validate(): void {
    if (!this.props.email || !this.isValidEmail(this.props.email)) {
      throw new Error('Invalid email');
    }

    if (!this.props.name || this.props.name.trim().length < 2) {
      throw new Error('Name must have at least 2 characters');
    }

    if (!this.props.googleId || this.props.googleId.trim().length === 0) {
      throw new Error('Google ID is required');
    }

    if (
      this.props.profilePicture &&
      !this.isValidUrl(this.props.profilePicture)
    ) {
      throw new Error('Invalid profile picture URL');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  get id(): UserId {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get googleId(): string {
    return this.props.googleId;
  }

  get profilePicture(): string | undefined {
    return this.props.profilePicture;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get lastLogin(): Date | undefined {
    return this.props.lastLogin;
  }

  updateName(newName: string): void {
    if (!newName || newName.trim().length < 2) {
      throw new Error('Name must have at least 2 characters');
    }
    this.props.name = newName;
    this.props.updatedAt = new Date();
  }

  updateProfilePicture(url: string): void {
    if (!this.isValidUrl(url)) {
      throw new Error('Invalid profile picture URL');
    }
    this.props.profilePicture = url;
    this.props.updatedAt = new Date();
  }

  removeProfilePicture(): void {
    this.props.profilePicture = undefined;
    this.props.updatedAt = new Date();
  }

  registerLogin(): void {
    this.props.lastLogin = new Date();
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.props.id.toString(),
      email: this.props.email,
      name: this.props.name,
      googleId: this.props.googleId,
      profilePicture: this.props.profilePicture,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt?.toISOString(),
      lastLogin: this.props.lastLogin?.toISOString(),
    };
  }
}
