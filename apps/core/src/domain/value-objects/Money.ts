export type Currency = 'BRL' | 'USD' | 'EUR';

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: Currency
  ) {
    this.validate();
  }

  static create(amount: number, currecy: Currency = 'BRL'): Money {
    return new Money(amount, currecy);
  }

  private validate(): void {
    if (this.amount < 0) {
      throw new Error('O valor não pode ser negativo');
    }

    if (!Number.isFinite(this.amount)) {
      throw new Error('O valor deve ser um número finito');
    }
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Não se pode adicionar valores de moedas diferentes');
    }

    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  format(): string {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: this.currency,
    });

    return formatter.format(this.amount);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toJSON() {
    return {
      amount: this.amount,
      currency: this.currency,
      formatted: this.format(),
    };
  }
}
