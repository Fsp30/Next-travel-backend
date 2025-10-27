export interface WikipediaPageInfo {
  title: string;
  extract: string;
  fullText?: string;
  url: string;
  thumbnail?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  categories?: string[];
  lastModified?: Date;
}

export interface WikipediaSummary {
  title: string;
  description: string;
  extract: string;
  url: string;
  thumbnail?: string;
}

export interface IWikipediaService {
  getPageInfo(
    pageTitle: string,
    language?: string
  ): Promise<WikipediaPageInfo | null>;
  getPageSummary(
    pageTitle: string,
    language?: string
  ): Promise<WikipediaSummary | null>;
  getCityInfo(
    cityName: string,
    state?: string,
    country?: string
  ): Promise<WikipediaPageInfo | null>;
  getCoordinates(
    pageTitle: string
  ): Promise<{ latitude: number; longitude: number } | null>;

  search(
    query: string,
    limit?: number
  ): Promise<
    Array<{
      title: string;
      snippet: string;
      pageId: number;
    }>
  >;

  pageExists(pageTitle: string, language?: string): Promise<boolean>;

  getFormattedExtract(
    pageTitle: string,
    maxLength?: number
  ): Promise<string | null>;
}
