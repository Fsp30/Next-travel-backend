import { Coordinates } from '../../domain/value-objects';

export interface WeatherData {
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
  timestamp: Date;
}

export interface WeatherForecast {
  date: Date;
  temperature: number;
  temperatureMin: number;
  temperatureMax: number;
  condition: string;
  description: string;
  humidity: number;
  chanceOfRain?: number;
}

export interface SeasonalWeather {
  season: 'summer' | 'autumn' | 'winter' | 'spring';
  averageTemperature: number;
  averageRainfall: number;
  description: string;
}

export interface IWeatherService {
  getCurrentWeather(coordinates: Coordinates): Promise<WeatherData>;
  getCurrentWeatherByCity(
    cityName: string,
    state?: string,
    country?: string
  ): Promise<WeatherData>;
  getForecast(
    coordinates: Coordinates,
    days?: number
  ): Promise<WeatherForecast[]>;
  getForecastByCity(
    cityName: string,
    state?: string,
    country?: string,
    days?: number
  ): Promise<WeatherForecast[]>;
  getWeatherForDate(
    coordinates: Coordinates,
    date: Date
  ): Promise<WeatherData | null>;
  getSeasonalWeather(
    coordinates: Coordinates,
    month: number
  ): Promise<SeasonalWeather>;

  isAvailable(): Promise<boolean>;
}
