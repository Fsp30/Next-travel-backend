import { CityId } from "../../domain/value-objects";
import { ICacheRepository } from "../../interfaces";
import { BaseUseCase } from "../shared";

export interface GetCachedResponseInput{
        cityId: string 
}

export interface GetCachedResponseOutput{
        data: string | null
        hit: boolean
}

export class GetCachedResponseUseCase extends BaseUseCase<GetCachedResponseInput, GetCachedResponseOutput>{
        constructor(private readonly cacheRepository: ICacheRepository){
                super()
        }

        async execute(input: GetCachedResponseInput): Promise<GetCachedResponseOutput> {
            if(input.)
        }
}
