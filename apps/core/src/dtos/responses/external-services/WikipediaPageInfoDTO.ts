import { z } from 'zod';

export const WikipediaPageInfoSchema = z.object({
  title: z.string(),
  extract: z.string(),
  fullText: z.string().optional(),
  url: z.url(),
  thumbnail: z.url().optional(),
  coordinates: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  categories: z.array(z.string()).optional(),
  lastModified: z.date().optional(),
});

export type WikipediaPageInfoDTO = z.infer<typeof WikipediaPageInfoSchema>;

export function mapWikipediaPageInfoToDTO(data: {
  title?: string;
  extract?: string;
  fulltext?: string;
  fullurl?: string;
  thumbnail?: {
    source?: string;
  };
  coordinates?: Array<{
    lat?: number;
    lon?: number;
  }>;
  categories?: Array<{
    title?: string;
  }>;
  touched?: string;
}): WikipediaPageInfoDTO {
  return {
    title: data.title ?? '',
    extract: data.extract ?? '',
    fullText: data.fulltext,
    url: data.fullurl ?? '',
    thumbnail: data.thumbnail?.source,
    coordinates:
      data.coordinates?.[0]?.lat && data.coordinates?.[0]?.lon
        ? {
            latitude: data.coordinates[0].lat,
            longitude: data.coordinates[0].lon,
          }
        : undefined,
    categories: data.categories?.map((cat) => cat.title ?? '').filter(Boolean),
    lastModified: data.touched ? new Date(data.touched) : undefined,
  };
}
