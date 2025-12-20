import { GenerateTravelGuideInput, GenerateTravelGuideOutput } from '../types';

export interface ILLMService {
  generateTravelGuide(
    input: GenerateTravelGuideInput
  ): Promise<GenerateTravelGuideOutput>;
  healthCheck(): Promise<boolean>;
}
