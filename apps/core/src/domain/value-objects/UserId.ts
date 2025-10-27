import { randomUUID } from 'crypto';

export class UserId {
  private constructor(public readonly value: string) {
    this.validate();
  }

  static create(value?: string): UserId {
    return new UserId(value ?? randomUUID());
  }

  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new Error('UserId nã pose ser vazio');
    }
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
