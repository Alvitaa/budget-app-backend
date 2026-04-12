import { IsNumberString, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class GetTransactionsDTO {
    @IsOptional()
    @IsNumberString()
    @Type(() => Number)
    month: number;

    @IsOptional()
    @IsNumberString()
    @Type(() => Number)
    year: number;

    @IsOptional()
    skip: number = 0;
}