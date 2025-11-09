import { z } from 'zod';

export const WikipediaSummaryDTOSchema = z.object({
  title: z.string(),
  extract: z.string(),
  description: z.string().optional().nullable(),
  desktopUrl: z.url(),
  mobileUrl: z.url(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  thumbnailUrl: z.url().optional().nullable(),
});

export type WikipediaSummaryDTO = z.infer<typeof WikipediaSummaryDTOSchema>;

export function mapWikipediaSummaryToDTO(data: any): WikipediaSummaryDTO {
  return {
    title: data.title,
    extract: data.extract,
    description: data.description,
    desktopUrl: data.content_urls?.desktop?.page,
    mobileUrl: data.content_urls?.mobile?.page,
    latitude: data.coordinates?.lat ?? null,
    longitude: data.coordinates?.lon ?? null,
    thumbnailUrl: data.thumbnail?.source ?? null,
  };
}
