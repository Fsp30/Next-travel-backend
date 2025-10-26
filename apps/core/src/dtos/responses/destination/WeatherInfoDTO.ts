import z from 'zod';

export const WeatherInfoDTOSchema = z.object({
  temperature: z.number().optional(),
  temparatureMin: z.number().optional(),
  temparatureMax: z.number().optional(),
  condition: z.string().optional(),
  humidity: z.number().min(0).max(100).optional(),
  description: z.string().optional(),
  winSpeed: z.number().optional(),
  pressure: z.number().optional(),
  forecastDate: z.iso.datetime().optional(),
});

export type WeatherInfoDTO = z.infer<typeof WeatherInfoDTOSchema>;
