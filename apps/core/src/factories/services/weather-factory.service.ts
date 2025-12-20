import { WeatherCurrentService } from '../../infrastructure/external-services/weather-service/weather-current.service';
import { WeatherForecastService } from '../../infrastructure/external-services/weather-service/weather-forecast.service';
import { WeatherOrchestratorService } from '../../infrastructure/external-services/weather-service/weather-orchestrator.service';
import { WeatherSeasonalService } from '../../infrastructure/external-services/weather-service/weather-seasonal.service';

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
