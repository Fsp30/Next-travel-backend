import { z } from 'zod';

export const SearchHistoryResponseDTOSchema = z.object({
  id: z.uuidv4(),
  cityName: z.string(),
  citySlug: z.string(),
  travelStartDate: z.iso.datetime().optional().nullable(),
  travelEndDate: z.iso.datetime().optional().nullable(),
  searchDate: z.iso.datetime(),
});

export type SearchHistoryResponseDTO = z.infer<
  typeof SearchHistoryResponseDTOSchema
>;

export function mapSearchHistoryToResponseDTO(history: {
  id: string;
  cityName: string;
  citySlug: string;
  travelStartDate?: Date;
  travelEndDate?: Date;
  searchDate: Date;
}): SearchHistoryResponseDTO {
  return {
    id: history.id,
    cityName: history.cityName,
    citySlug: history.citySlug,
    travelStartDate: history.travelStartDate?.toISOString(),
    travelEndDate: history.travelEndDate?.toISOString(),
    searchDate: history.searchDate.toISOString(),
  };
}
