import { IsNumber, IsNumberString, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class GetTransactionsDTO {
    @IsOptional()
    @IsNumberString()
    @Type(() => Number)
    month?: number;

    @IsOptional()
    @IsNumberString()
    @Type(() => Number)
    year?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    take: number = 20;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    skip: number = 0;
}
