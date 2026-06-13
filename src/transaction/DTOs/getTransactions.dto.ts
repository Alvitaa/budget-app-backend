import { IsNumber, IsNumberString, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class GetTransactionsDTO {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    month?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
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
