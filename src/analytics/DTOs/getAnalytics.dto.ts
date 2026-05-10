import { Type } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

export class GetAnalyticsDTO {
    @IsNumber()
    @Type(() => Number)
    year!: number;
    
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    month?: number;

}
