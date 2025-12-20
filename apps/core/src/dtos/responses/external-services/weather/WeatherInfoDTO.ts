import z from 'zod';
import {
  SeasonalWeatherSchema,
  WeatherDataSchema,
  WeatherForecastSchema,
} from '..';

export const WeatherInfoDTOSchema = z
  .object({
    current: WeatherDataSchema.optional(),
    forecast: z.array(WeatherForecastSchema).optional(),
    seasonal: SeasonalWeatherSchema.optional(),
  })
  .optional();

export type WeatherInfoDTO = z.infer<typeof WeatherInfoDTOSchema>;
