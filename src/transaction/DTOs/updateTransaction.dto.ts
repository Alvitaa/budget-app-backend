import { TransactionType } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import {
    IsDateString,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Min,
} from "class-validator";

export class UpdateTransactionDTO {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0.01)
    amount?: number;

    @IsOptional()
    @IsEnum(TransactionType)
    type?: TransactionType;

    @IsOptional()
    @IsDateString()
    date?: string;

    @IsOptional()
    @Transform(({ value }) => value === "" ? undefined : value)
    @IsUUID()
    categoryId?: string;

    @IsOptional()
    @Transform(({ value }) => value === "" ? undefined : value)
    @IsUUID()
    accountId?: string;
}
