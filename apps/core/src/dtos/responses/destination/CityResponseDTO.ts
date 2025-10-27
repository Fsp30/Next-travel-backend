import z from 'zod';

export const CityResponseDTOSchema = z.object({
  id: z.uuidv4(),
  name: z.string(),
  state: z.string(),
  country: z.string(),
  slug: z.string(),
  coordinates: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  requestCount: z.number(),
  isPopular: z.boolean(),
});

export type CityResponseDTO = z.infer<typeof CityResponseDTOSchema>;

export function mapCityToResponseDTO(city: {
  id: string;
  name: string;
  state: string;
  country: string;
  slug: string;
  latitude?: number;
  longitude?: number;
  requestCount: number;
  isPopular: boolean;
}): CityResponseDTO {
  return {
    id: city.id,
    name: city.name,
    state: city.state,
    country: city.country,
    slug: city.slug,
    coordinates:
      city.latitude && city.longitude
        ? { latitude: city.latitude, longitude: city.longitude }
        : undefined,
    requestCount: city.requestCount,
    isPopular: city.isPopular,
  };
}
