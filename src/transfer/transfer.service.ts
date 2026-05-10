import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { AccountService } from "src/account/accounts.service";
import { PrismaService } from "src/prisma/prisma.service";
import { TransactionService } from "src/transaction/transaction.service";
import { CreateTransferDTO } from "./DTOs/createTransfer.dto";
import { ResponseTransferDTO } from "./DTOs/responseTransfer.dto";
import { UpdateTransferDTO } from "./DTOs/updateTransfer.dto";

@Injectable()
export class TransferService {
    constructor(
        private prisma: PrismaService,
        private transactionService: TransactionService,
        private accountService: AccountService,
    ) {}

    async getTransfers(userId: string, take: number, skip: number): Promise<ResponseTransferDTO[]> {
        const transfers = await this.prisma.transfer.findMany({
            where: { userId },
            include: {
                transactions: {
                    include: {
                        account: {
                            select: {
                                id: true,
                                name: true
                            },
                        },
                    },
                },
            },
            orderBy: { date: "desc" },
            take: take,
            skip: skip,
        });

        return transfers.map((t) => {
            const fromTx = t.transactions.find((tx) => tx.type === "EXPENSE");
            const toTx = t.transactions.find((tx) => tx.type === "INCOME");

            return {
                id: t.id,
                amount: Number(t.amount),
                date: t.date,
                fromAccount: fromTx?.account ?? null,
                toAccount: toTx?.account ?? null,
            };
        });
    }

    async getTransfersByDate(userId: string, year: number, month?: number, take: number = 20, skip: number = 0): Promise<ResponseTransferDTO[]> {
        let start, end;
        if (month !== undefined) {
            start = new Date(year, month - 1, 1);
            end = new Date(year, month, 0);
        } else {
            start = new Date(year, 0, 1);
            end = new Date(year, 12, 0);
        }

        const transfers = await this.prisma.transfer.findMany({
            where: {
                userId,
                date: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                transactions: {
                    include: {
                        account: {
                            select: {
                                id: true,
                                name: true
                            },
                        },
                    },
                },
            },
            orderBy: { date: "desc" },
            take: take,
            skip: skip,
        });

        return transfers.map((t) => {
            const fromTx = t.transactions.find((tx) => tx.type === "EXPENSE");
            const toTx = t.transactions.find((tx) => tx.type === "INCOME");

            return {
                id: t.id,
                amount: Number(t.amount),
                date: t.date,
                fromAccount: fromTx?.account ?? null,
                toAccount: toTx?.account ?? null,
            };
        });
    }

    async getTransferById(
        userId: string,
        trasnferId: string,
        tx?: Prisma.TransactionClient,
    ): Promise<ResponseTransferDTO> {
        const client = tx ?? this.prisma;

        const transfer = await client.transfer.findFirst({
            where: { id: trasnferId, userId },
            include: {
                transactions: {
                    include: {
                        account: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
        });

        if (!transfer) throw new NotFoundException("Transfer not found");

        if (userId !== transfer.userId) {
            throw new ForbiddenException("Can't access other user's transfer");
        }

        const fromTx = transfer.transactions.find((t) => t.type === "EXPENSE");
        const toTx = transfer.transactions.find((t) => t.type === "INCOME");

        return {
            id: transfer.id,
            fromAccount: fromTx?.account ?? null,
            toAccount: toTx?.account ?? null,
            amount: Number(transfer.amount),
            date: transfer.date,
        };
    }

    async createTransfer(userId: string, dto: CreateTransferDTO) {
        const { fromAccountId, toAccountId, amount } = dto;
        return this.prisma.$transaction(async (tx) => {
            const fromAccount = await this.accountService.getAccountById(
                userId,
                fromAccountId,
                tx,
            );
            const toAccount = await this.accountService.getAccountById(
                userId,
                toAccountId,
                tx,
            );

            const date = new Date();
            const transfer = await tx.transfer.create({
                data: {
                    userId,
                    fromAccountId,
                    toAccountId,
                    amount,
                    date,
                },
            });

            await this.transactionService.createTransaction(
                userId,
                {
                    title: "Trans. from " + fromAccount.name,
                    type: "EXPENSE",
                    amount,
                    accountId: toAccountId,
                    transferId: transfer.id,
                    date: date.toISOString().split("T")[0],
                },
                tx,
            );

            await this.transactionService.createTransaction(
                userId,
                {
                    title: "Trans. to " + toAccount.name,
                    type: "INCOME",
                    amount,
                    accountId: fromAccountId,
                    transferId: transfer.id,
                    date: date.toISOString().split("T")[0],
                },
                tx,
            );
        });
    }

    async updateTransfer(
        userId: string,
        transferId: string,
        dto: UpdateTransferDTO,
    ) {
        return this.prisma.$transaction(async (tx) => {
            const transfer = await tx.transfer.findUnique({
                where: { id: transferId, userId },
                include: {
                    transactions: {
                        include: {
                            account: {
                                select: { name: true },
                            },
                        },
                    },
                },
            });

            if (!transfer || transfer.userId !== userId) {
                throw new NotFoundException();
            }

            const amount = dto.amount ?? transfer.amount;
            const fromAccountId = dto.fromAccountId ?? transfer.fromAccountId;
            const toAccountId = dto.toAccountId ?? transfer.toAccountId;

            if (fromAccountId === toAccountId) {
                throw new BadRequestException("Same account");
            }

            await tx.transfer.update({
                where: { id: transferId },
                data: {
                    amount,
                    fromAccountId,
                    toAccountId,
                },
            });

            const expenseTx = transfer.transactions.find(
                (t) => t.type === "EXPENSE",
            );
            const incomeTx = transfer.transactions.find(
                (t) => t.type === "INCOME",
            );

            if (expenseTx) {
                await this.transactionService.updateTransaction(
                    userId,
                    expenseTx.id,
                    {
                        amount: Number(amount),
                        title: "Trans. from " + expenseTx.account?.name,
                        accountId: toAccountId,
                    },
                    tx,
                );
            }

            if (incomeTx) {
                await this.transactionService.updateTransaction(
                    userId,
                    incomeTx.id,
                    { amount: Number(amount), title: "Trans. to " + incomeTx.account?.name, accountId: fromAccountId },
                    tx,
                );
            }

            return { success: true };
        });
    }

    async deleteTransfer(userId: string, transferId: string) {
        await this.getTransferById(userId, transferId);

        return this.prisma.$transaction(async (tx) => {
            const transfer = await tx.transfer.findUnique({
                where: { id: transferId, userId },
                include: { transactions: true },
            });

            if (!transfer || transfer.userId !== userId) {
                throw new NotFoundException();
            }

            for (const t of transfer.transactions) {
                const delta = this.transactionService.getDelta(
                    t.type,
                    Number(t.amount)
                );

                await this.accountService.incrementAccountBalance(
                    userId,
                    t.accountId!,
                    -delta,
                    tx,
                );
            }

            await tx.transaction.deleteMany({
                where: { transferId },
            });

            await tx.transfer.delete({
                where: { id: transferId },
            });

            return { success: true };
        });
    }
}
