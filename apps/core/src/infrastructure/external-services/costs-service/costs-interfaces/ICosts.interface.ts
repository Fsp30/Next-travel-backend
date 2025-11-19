export interface DailyBudgetEstimate {
  budget: number;
  midRange: number;
  luxury: number;
}

export interface TotalEstimate {
  min: number;
  max: number;
}

export interface CostSources {
  transport: 'api' | 'estimated';
  accommodation: 'api' | 'estimated';
}




 