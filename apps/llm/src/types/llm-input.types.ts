export interface GenerateTravelGuideInput {
  cityName: string;

  state?: string;

  country: string;

  cityInfo?: string;

  weather?: {
    current?: {
      temperature: number;
      condition: string;
      description?: string;
      humidity?: number;
    };
    forecast?: Array<{
      date: Date;
      temperature: number;
      condition: string;
    }>;
    seasonal?: {
      season: string;
      averageTemperature: number;
      description?: string;
    };
  };

  costs?: {
    transport?: {
      bus?: { min?: number; max?: number };
      flight?: { min?: number; max?: number };
    };
    accommodation?: {
      budget?: { min?: number; max?: number };
      midRange?: { min?: number; max?: number };
      luxury?: { min?: number; max?: number };
    };
    currency?: string;
  };

  travelInfo?: {
    startDate?: Date;
    endDate?: Date;
    numberOfNights?: number;
    origin?: string;
  };
}
