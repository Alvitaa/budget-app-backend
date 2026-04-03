import { IsNumberString, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class GetTransactionsDTO {
    @IsNumberString()
    @Type(() => Number)
    month: number;

    @IsNumberString()
    @Type(() => Number)
    year: number;

    @IsOptional()
    @IsNumberString()
    @Type(() => Number)
    skip?: number = 0;
}