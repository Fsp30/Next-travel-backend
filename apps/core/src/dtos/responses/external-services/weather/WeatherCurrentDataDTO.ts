import { z } from 'zod';

export const WeatherDataSchema = z.object({
  temperature: z.number(),
  temperatureMin: z.number().optional(),
  temperatureMax: z.number().optional(),
  feelsLike: z.number().optional(),
  condition: z.string(),
  description: z.string(),
  humidity: z.number(),
  windSpeed: z.number(),
  pressure: z.number(),
  cloudiness: z.number().optional(),
  visibility: z.number().optional(),
  timestamp: z.coerce.date(),
});

export type WeatherCurrentDataDTO = z.infer<typeof WeatherDataSchema>;

export function mapCurrentWeatherToDTO(data: {
  main?: {
    temp?: number;
    temp_min?: number;
    temp_max?: number;
    feels_like?: number;
    humidity?: number;
    pressure?: number;
  };
  weather?: Array<{
    main?: string;
    description?: string;
  }>;
  wind?: {
    speed?: number;
  };
  clouds?: {
    all?: number;
  };
  visibility?: number;
  dt?: number;
}): WeatherCurrentDataDTO {
  return {
    temperature: data.main?.temp ?? 0,
    temperatureMin: data.main?.temp_min,
    temperatureMax: data.main?.temp_max,
    feelsLike: data.main?.feels_like,
    condition: data.weather?.[0]?.main ?? 'Unknown',
    description: data.weather?.[0]?.description ?? '',
    humidity: data.main?.humidity ?? 0,
    windSpeed: data.wind?.speed ?? 0,
    pressure: data.main?.pressure ?? 0,
    cloudiness: data.clouds?.all,
    visibility: data.visibility,
    timestamp: data.dt ? new Date(data.dt * 1000) : new Date(),
  };
}
