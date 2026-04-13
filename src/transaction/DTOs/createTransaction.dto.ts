import { TransactionType } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class CreateTransactionDTO {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0.01)
    amount: number;

    @IsEnum(TransactionType)
    type: TransactionType;

    @IsDateString()
    date: string;

    @IsOptional()
    @Transform(({ value }) => value === "" ? undefined : value)
    @IsUUID()
    categoryId?: string;

    @IsOptional()
    @Transform(({ value }) => value === "" ? undefined : value)
    @IsUUID()
    accountId?: string;
}