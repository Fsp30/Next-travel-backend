export abstract class BaseService<I = void, O = void> {
  /**
   * @param input - Dados de entrada (pode ser void)
   * @returns Promise com resultado da operação
   */
  abstract execute(input: I): Promise<O>;
}

export type ServiceInput<T> =
  T extends BaseService<infer I, unknown> ? I : never;

export type ServiceOutput<T> =
  T extends BaseService<infer O, unknown> ? O : never;
