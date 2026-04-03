import { TransactionType } from "@prisma/client";
import { IsEnum, IsString, IsUUID } from "class-validator";

export class ResponseCategoryDTO {
    @IsUUID()
    id: string;

    @IsString()
    name: string;

    @IsEnum(TransactionType)
    type: TransactionType;

    @IsUUID()
    userId: string;
}