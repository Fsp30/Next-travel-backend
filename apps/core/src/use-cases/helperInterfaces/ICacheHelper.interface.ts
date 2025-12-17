import { HotelInfo } from '../../infrastructure/external-services/costs-service/accommodation-service/interface/IHotels.interface';

export interface CachedResponseRaw {
  cityInfo?: string;
  generatedText?: string;
  generatedAt?: string | Date;
  hotels?: HotelInfo[];
  weatherInfo?: CachedWeatherInfoRaw;
  costsTotal?: CachedCostsTotalRaw;
}

interface CachedWeatherInfoRaw {
  current?: {
    temperature?: number;
    temperatureMin?: number;
    temperatureMax?: number;
    feelsLike?: number;
    condition?: string;
    description?: string;
    humidity?: number;
    windSpeed?: number;
    pressure?: number;
    cloudiness?: number;
    visibility?: number;
    timestamp?: string | Date;
    generatedAt?: string | Date;
  };
  forecast?: Array<{
    date?: string | Date;
    temperature?: number;
    temperatureMin?: number;
    temperatureMax?: number;
    condition?: string;
    description?: string;
    humidity?: number;
    chanceOfRain?: number;
  }>;
  seasonal?: {
    season: string;
    averageTemperature: number;
    averageRainfall?: number;
    description?: string;
  };
}

interface CachedCostsTotalRaw {
  accommodation?: {
    budgetMin?: number;
    budgetMax?: number;
    midRangeMin?: number;
    midRangeMax?: number;
    luxuryMin?: number;
    luxuryMax?: number;
  };
  transport?: {
    busMin?: number;
    busMax?: number;
    flightMin?: number;
    flightMax?: number;
  };
  estimateDailyBudget?: {
    budget?: number;
    midRange?: number;
    luxury?: number;
  };
  totalEstimate?: {
    min?: number;
    max?: number;
  };
  costsSources?: {
    transport: string;
    accommodation: string;
  };
}
