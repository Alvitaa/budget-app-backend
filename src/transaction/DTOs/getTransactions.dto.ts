import { IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { Type } from "class-transformer";
import { TransactionType } from "@prisma/client";

export class GetTransactionsDTO {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsUUID()
    categoryId?: number;

    @IsOptional()
    @IsUUID()
    accountId?: number;

    @IsOptional()
    @IsString()
    type?: TransactionType;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    year?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    month?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    day?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    pageSize: number = 20;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    page: number = 0;
}
