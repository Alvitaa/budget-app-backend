import { Optional } from "@nestjs/common";
import { TransactionType } from "@prisma/client";
import { IsEnum } from "class-validator";

export class GetCategoryDTO {
    @Optional()
    @IsEnum(TransactionType)
    type?: TransactionType;
}