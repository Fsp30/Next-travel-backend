import { isAfter, differenceInDays, isBefore } from 'date-fns';

export class DataRange {
  private constructor(
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {
    this.validate();
  }

  static create(startDate: Date, endDate: Date): DataRange {
    return new DataRange(startDate, endDate);
  }

  static createFormStrings(
    startDateStr: string,
    endDateStr: string
  ): DataRange {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Formato de data inválido');
    }

    return new DataRange(start, end);
  }

  private validate(): void {
    if (isAfter(this.startDate, this.endDate)) {
      throw new Error('O começo da viagem deve estar antes da data do fim');
    }

    const maxDuration = 90;
    if (this.getDurationInDays() > maxDuration) {
      throw new Error(
        `A viagem tem seu tempo máximo de ${maxDuration} dias excedido`
      );
    }
  }

  getDurationInDays(): number {
    return differenceInDays(this.endDate, this.startDate) + 1;
  }

  isInFuture(): boolean {
    return isAfter(this.startDate, new Date());
  }

  contains(date: Date): boolean {
    return !isBefore(date, this.startDate) && !isAfter(date, this.endDate);
  }

  toString(): string {
    return `${this.startDate.toISOString().split('T')[0]} to ${this.endDate.toISOString().split('T')[0]}`;
  }
}
