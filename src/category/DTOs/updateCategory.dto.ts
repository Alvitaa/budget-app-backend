import { TransactionType } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class UpdateCategoryDTO {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEnum(TransactionType)
    type?: TransactionType;
}
