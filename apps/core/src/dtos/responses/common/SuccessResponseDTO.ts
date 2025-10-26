import { z } from 'zod';

export const SuccessResponseDTOSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    timestamp: z.iso.datetime(),
  });

export type SuccessResponseDTO<T> = {
  success: true;
  data: T;
  timestamp: string;
};

export function createSuccessResponse<T>(data: T): SuccessResponseDTO<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}
