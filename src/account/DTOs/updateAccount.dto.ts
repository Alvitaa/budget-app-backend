import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateAccountDTO {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsNumber()
    balance?: number;
}
