import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateAccountDTO {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsNumber()
    balance?: number;
}
