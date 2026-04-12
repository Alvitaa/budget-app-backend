import { TransactionType } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";

export class GetCategoryDTO {
    @IsOptional()
    @IsEnum(TransactionType)
    type?: TransactionType;
}