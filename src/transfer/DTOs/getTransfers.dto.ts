import { Type } from "class-transformer";
import { IsNumber, IsNumberString, IsOptional } from "class-validator";

export class GetTransfersDTO {
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
