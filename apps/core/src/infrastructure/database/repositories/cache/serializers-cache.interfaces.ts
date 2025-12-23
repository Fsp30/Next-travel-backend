import {
  accommodationEnum,
  transportEnum,
} from '@/core/src/domain/entities/CachedResponse';

export interface SerializedWeatherCurrent {
  temperature: number;
  temperatureMin?: number;
  temperatureMax?: number;
  feelsLike?: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  cloudiness?: number;
  visibility?: number;
  timestamp: string;
}

export interface SerializedForecast {
  date: string;
  temperature: number;
  temperatureMin: number;
  temperatureMax: number;
  condition: string;
  description: string;
  humidity: number;
  chanceOfRain?: number;
}

export interface SerializedWeatherInfo {
  current?: SerializedWeatherCurrent;
  forecast?: SerializedForecast[];
  seasonal?: {
    season: 'summer' | 'autumn' | 'winter' | 'spring';
    averageTemperature: number;
    averageRainfall: number;
    description: string;
  };
}

export interface SerializedCostsTotal {
  transport?: {
    busMin?: number;
    busMax?: number;
    flightMin?: number;
    flightMax?: number;
  };
  accommodation?: {
    budgetMin?: number;
    budgetMax?: number;
    midRangeMin?: number;
    midRangeMax?: number;
    luxuryMin?: number;
    luxuryMax?: number;
  };
  estimateDailyBudget?: {
    bugdet?: number;
    midRange?: number;
    luxury?: number;
  };
  totalEstimate?: {
    min?: number;
    max?: number;
  };
  costsSources: {
    transport: transportEnum;
    accommodation: accommodationEnum;
  };
}

interface SerializedHotel {
  hotelId: string;
  name: string;
  cityCode?: string;
  rating?: string;
  geoCode?: {
    latitude?: number;
    longitude?: number;
  };
}

export interface SerializedResponseData {
  cityInfo: string;
  weatherInfo?: SerializedWeatherInfo;
  costsTotal?: SerializedCostsTotal;
  generatedText?: string;
  generatedAt?: string;
  hotels?: SerializedHotel[];
}

export interface SerializedCachedResponse {
  cityId: string;
  responseData: SerializedResponseData;
  createdAt: string;
  expiresAt: string;
  hitCount: number;
}
