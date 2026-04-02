import { IsNumber, IsString } from "class-validator";

export class UpdateAccountDTO {
    @IsString()
    title?: string;

    @IsNumber()
    balance?: number;
}