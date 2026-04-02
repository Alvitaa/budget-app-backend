import { IsNumber, IsString } from "class-validator";

export class CreateAccountDTO {
    @IsString()
    name: string;

    @IsNumber()
    balance?: number;
}