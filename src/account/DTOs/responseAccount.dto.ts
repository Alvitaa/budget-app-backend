import { IsBoolean, IsNumber, IsString, IsUUID } from "class-validator";

export class ResponseAccountDTO {
    @IsUUID()
    id!: string;

    @IsString()
    name!: string;

    @IsNumber()
    balance!: number;

    @IsBoolean()
    isFavorite!: boolean;

    @IsUUID()
    userId!: string;
}