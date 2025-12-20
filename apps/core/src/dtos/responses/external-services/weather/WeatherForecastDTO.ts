import { z } from 'zod';

export const WeatherForecastSchema = z.object({
  date: z.date(),
  temperature: z.number(),
  temperatureMin: z.number(),
  temperatureMax: z.number(),
  condition: z.string(),
  description: z.string(),
  humidity: z.number(),
  chanceOfRain: z.number().optional(),
});

export type WeatherForecastDTO = z.infer<typeof WeatherForecastSchema>;

export function mapForecastToDTO(data: {
  dt?: number;
  main?: {
    temp?: number;
    temp_min?: number;
    temp_max?: number;
    humidity?: number;
  };
  weather?: Array<{
    main?: string;
    description?: string;
  }>;
  pop?: number;
}): WeatherForecastDTO {
  return {
    date: data.dt ? new Date(data.dt * 1000) : new Date(),
    temperature: data.main?.temp ?? 0,
    temperatureMin: data.main?.temp_min ?? 0,
    temperatureMax: data.main?.temp_max ?? 0,
    condition: data.weather?.[0]?.main ?? 'Unknown',
    description: data.weather?.[0]?.description ?? '',
    humidity: data.main?.humidity ?? 0,
    chanceOfRain: data.pop ? data.pop * 100 : undefined,
  };
}
