import { Type } from "class-transformer";
import { IsUUID, IsNumber, Min, IsDateString, IsDate } from "class-validator";

export class ResponseTransferDTO {
    @IsUUID()
    id!: string;

    fromAccount!: {
        id: string;
        name: string;
    } | null;

    toAccount!: {
        id: string;
        name: string;
    } | null;

    @Type(() => Number)
    @IsNumber()
    @Min(0.01)
    amount!: number;

    @IsDate()
    date!: Date;
}
