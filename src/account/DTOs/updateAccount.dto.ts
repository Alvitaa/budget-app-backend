import { Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateAccountDTO {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    balance?: number;

    @IsBoolean()
    isFavorite?: boolean = false;
}
