import { Type } from "class-transformer";
import { IsUUID, IsNumber, Min } from "class-validator";

export class CreateTransferDTO {
    @IsUUID()
    fromAccountId!: string;

    @IsUUID()
    toAccountId!: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0.01)
    amount!: number;
}
