import { TransactionType } from "@prisma/client";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class CreateTransactionDTO {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNumber()
    @Min(0.01)
    amount: number;

    @IsEnum(TransactionType)
    type: TransactionType;

    @IsDateString()
    date: string;

    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @IsOptional()
    @IsUUID()
    accountId?: string;
}