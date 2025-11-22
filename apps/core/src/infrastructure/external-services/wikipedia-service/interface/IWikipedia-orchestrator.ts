import { WikipediaCityInfoOutput } from '../wikipedia-city-info.service';
import { WikipediaSearchOutput } from '../wikipedia-search.service';
import { WikipediaSummaryOutput } from '../wikipedia-summary.service';

export interface WikipediaCompleteCityInfoInput {
  cityName: string;
  state?: string;
  country?: string;
  includeSummary?: boolean;
  searchRelatedTerms?: string[];
}

export interface WikipediaCompleteCityInfoOutput {
  cityInfo: WikipediaCityInfoOutput;
  summary?: WikipediaSummaryOutput;
  relatedSearches?: WikipediaSearchOutput[];
}

export interface WikipediaIntelligentSearchInput {
  query: string;
  includeSummaries?: boolean;
  includeCityInfo?: boolean;
  limit?: number;
}

export interface WikipediaIntelligentSearchOutput {
  search: WikipediaSearchOutput;
  summaries?: WikipediaSummaryOutput[];
  cityInfo?: WikipediaCityInfoOutput;
}

export interface WikipediaLocationAnalysisInput {
  location: string;
  includeImages?: boolean;
  includeRelated?: boolean;
  maxRelatedResults?: number;
}

export interface WikipediaLocationAnalysisOutput {
  primaryInfo: WikipediaCityInfoOutput | WikipediaSummaryOutput;
  relatedArticles?: WikipediaSearchOutput;
  coordinates?: {
    lat: number;
    lon: number;
  };
  thumbnail?: string;
  categories?: string[];
}
