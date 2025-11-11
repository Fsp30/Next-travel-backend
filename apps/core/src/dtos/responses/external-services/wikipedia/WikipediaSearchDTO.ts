import { z } from 'zod';

export const WikipediaSearchResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  snippet: z.string(),
  url: z.url(),
});

export const WikipediaSearchDTOSchema = z.object({
  query: z.string(),
  results: z.array(WikipediaSearchResultSchema),
});

export type WikipediaSearchDTO = z.infer<typeof WikipediaSearchDTOSchema>;

export function mapWikipediaSearchToDTO(data: {
  query?: {
    searchinfo?: {
      text?: string;
    };
    search?: Array<{
      pageid: number;
      title: string;
      snippet: string;
    }>;
  };
}): WikipediaSearchDTO {
  const query = data?.query?.searchinfo?.text ?? '';
  const results =
    data?.query?.search?.map((item) => ({
      id: item.pageid.toString(),
      title: item.title,
      snippet: item.snippet,
      url: `https://pt.wikipedia.org/?curid=${item.pageid}`,
    })) ?? [];

  return {
    query,
    results,
  };
}
