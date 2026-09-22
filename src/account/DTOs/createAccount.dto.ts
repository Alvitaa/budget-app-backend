import { Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateAccountDTO {
    @IsString()
    name!: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    balance?: number = 0;

    @IsBoolean()
    isFavorite: boolean = false;
}