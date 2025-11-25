import z from 'zod';

export const SeasonalWeatherSchema = z.object({
  season: z.enum(['summer', 'autumn', 'winter', 'spring']),
  averageTemperature: z.number(),
  averageRainfall: z.number(),
  description: z.string(),
});

export type SeasonalWeatherDTO = z.infer<typeof SeasonalWeatherSchema>;
