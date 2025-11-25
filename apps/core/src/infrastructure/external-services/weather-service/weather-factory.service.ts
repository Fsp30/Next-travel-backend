import { WeatherCurrentService } from './weather-current.service';
import { WeatherForecastService } from './weather-forecast.service';
import { WeatherOrchestratorService } from './weather-orchestrator.service';
import { WeatherSeasonalService } from './weather-seasonal.service';

export class WeatherServiceFactory {
  static create(): WeatherOrchestratorService {
    const currentWeatherService = new WeatherCurrentService();
    const forecastService = new WeatherForecastService();
    const seasonalWeatherService = new WeatherSeasonalService();

    return new WeatherOrchestratorService(
      currentWeatherService,
      forecastService,
      seasonalWeatherService
    );
  }

  static createWithServices(
    currentWeatherService: WeatherCurrentService,
    forecastService: WeatherForecastService,
    seasonalWeatherService: WeatherSeasonalService
  ): WeatherOrchestratorService {
    return new WeatherOrchestratorService(
      currentWeatherService,
      forecastService,
      seasonalWeatherService
    );
  }
}
