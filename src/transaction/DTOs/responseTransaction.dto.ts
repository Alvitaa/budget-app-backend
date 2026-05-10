import { TransactionType } from "@prisma/client";

export class ResponseTransactionDTO {
    id!: string;
    title!: string;
    description!: string | null;
    amount!: number;
    type!: TransactionType;
    date!: Date;
    userId!: string;
    category!: {
        id: string;
        name: string;
    } | null ;
    account!: {
        id: string;
        name: string;
    } | null ;
}