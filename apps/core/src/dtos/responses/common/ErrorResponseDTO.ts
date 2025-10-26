import { z } from 'zod';

export const ErrorResponseDTOSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
  timestamp: z.iso.datetime(),
});

export type ErrorResponseDTO = z.infer<typeof ErrorResponseDTOSchema>;

export function createErrorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ErrorResponseDTO {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  };
}
