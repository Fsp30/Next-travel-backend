export abstract class BaseUseCase<I = void, O = void> {
  /**
   * @param input - Dados de entrada (pode ser void se não houver input)
   * @returns Promise com resultado da operação
   */
  abstract execute(input: I): Promise<O>;
}

export type UseCaseInput<T> =
  T extends BaseUseCase<infer I, unknown> ? I : never;

export type UseCaseOutput<T> =
  T extends BaseUseCase<infer O, unknown> ? O : never;
