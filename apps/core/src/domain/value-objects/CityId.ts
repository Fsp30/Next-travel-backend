import { randomUUID } from 'crypto';

export class CityId {
  private constructor(public readonly value: string) {
    this.validate();
  }

  static create(value?: string): CityId {
    return new CityId(value ?? randomUUID());
  }

  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new Error('CityId não pode ser vazio');
    }
  }

  equals(other: CityId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
