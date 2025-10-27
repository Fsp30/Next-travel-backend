export class Coordinates {
  private constructor(
    public readonly latitude: number,
    public readonly longitude: number
  ) {
    this.validate();
  }

  static create(latitude: number, longitude: number): Coordinates {
    return new Coordinates(latitude, longitude);
  }

  private validate(): void {
    if (this.latitude < -90 || this.latitude > 90) {
      throw new Error('Latitude deve estar entre -90 e 90');
    }

    if (this.longitude < -180 || this.longitude > 180) {
      throw new Error('Longitude deve estar entre -180 e 180');
    }
  }

  distanceTo(other: Coordinates): number {
    const R = 6371;
    const dLat = this.toRadians(other.latitude - this.latitude);
    const dLon = this.toRadians(other.longitude - this.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(this.latitude)) *
        Math.cos(this.toRadians(other.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  toString(): string {
    return `${this.latitude}, ${this.longitude}`;
  }

  toJSON() {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
    };
  }
}
