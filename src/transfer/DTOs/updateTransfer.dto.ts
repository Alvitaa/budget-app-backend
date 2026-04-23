import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsUUID, Min } from "class-validator";

export class UpdateTransferDTO {
    @IsOptional()
    @IsUUID()
    fromAccountId?: string;

    @IsOptional()
    @IsUUID()
    toAccountId?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0.01)
    amount?: number;
}
