import { TransactionType } from "@prisma/client";
import { IsEnum, IsString } from "class-validator";

export class CategoryDTO {
    @IsString()
    name: string;

    @IsEnum(TransactionType)
    type: TransactionType;
}