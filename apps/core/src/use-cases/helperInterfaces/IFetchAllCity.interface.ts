import {
  CostsServiceOutput,
  WeatherOrchestratorOutput,
  WikipediaOrchestratorOutput,
} from '../../infrastructure';

export interface IFetchedCityData {
  wikipediaResponse: WikipediaOrchestratorOutput | null;
  weatherResponse: WeatherOrchestratorOutput | null;
  costsResponse: CostsServiceOutput | null;
}
