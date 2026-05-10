import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateTransactionDTO } from "./DTOs/createTransaction.dto";
import { CategoryService } from "src/category/category.service";
import { AccountService } from "src/account/accounts.service";
import { UpdateTransactionDTO } from "./DTOs/updateTransaction.dto";
import { GetTransactionsDTO } from "./DTOs/getTransactions.dto";
import { Prisma, TransactionType } from "@prisma/client";
import { ResponseTransactionDTO } from "./DTOs/responseTransaction.dto";
import { getDateRange } from "src/common/utils/dateRange";

@Injectable()
export class TransactionService {
    constructor(
        private prisma: PrismaService,
        private categoryService: CategoryService,
        private accountService: AccountService,
    ) {}

    getDelta(type: TransactionType, amount: number): number {
        switch (type) {
            case "INCOME":
                return amount;
            case "EXPENSE":
            case "SAVING":
                return -amount;
            default:
                return 0;
        }
    }

    async createTransaction(userId: string, dto: CreateTransactionDTO, tx?: Prisma.TransactionClient) {
        const client = tx ?? this.prisma;
        if (dto.categoryId) {
            const category = await this.categoryService.getCategoryById(userId, dto.categoryId, client);
            
            if (category.type !== dto.type)
                throw new BadRequestException(
                    "Category type does not match transaction type",
                );
        }

        if (dto.accountId) {
            await this.accountService.getAccountById(userId, dto.accountId, client);

            const delta = this.getDelta(dto.type, dto.amount);

            await this.accountService.incrementAccountBalance(
                userId,
                dto.accountId,
                delta,
                client
            );
        }

        return client.transaction.create({
            data: {
                ...dto,
                date: new Date(dto.date),
                userId,
            },
            select: {
                id: true,
                title: true,
                description: true,
                amount: true,
                type: true,
                date: true,
                userId: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                account: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    async getTransactions(userId: string, take: number, skip: number) {
        return this.prisma.transaction.findMany({
            where: {
                userId,
            },
            select: {
                id: true,
                title: true,
                description: true,
                amount: true,
                type: true,
                date: true,
                userId: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                account: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { date: "desc" },
            take: take,
            skip: skip,
        });
    }

    async getTransactionsByDate(
        userId: string,
        year: number,
        month?: number,
        take: number = 20,
        skip: number = 0,
    ) {
        const { start, end } = getDateRange(year, month);

        return this.prisma.transaction.findMany({
            where: {
                userId,
                date: {
                    gte: start,
                    lt: end,
                },
            },
            select: {
                id: true,
                title: true,
                description: true,
                amount: true,
                type: true,
                date: true,
                userId: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                account: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                date: "desc",
            },
            take: take,
            skip: skip
        });
    }

    async getTransactionById(
        userId: string,
        transactionId: string,
        tx?: Prisma.TransactionClient,
    ) {
        const client = tx ?? this.prisma;

        const transaction = await client.transaction.findFirst({
            where: {
                id: transactionId,
                userId,
            },
            select: {
                id: true,
                title: true,
                description: true,
                amount: true,
                type: true,
                date: true,
                userId: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                account: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!transaction) throw new NotFoundException("Transaction not found");

        if (userId !== transaction.userId) {
            throw new ForbiddenException(
                "Can't access other user's transaction",
            );
        }

        return transaction;
    }

    async updateTransaction(
        userId: string,
        transactionId: string,
        dto: UpdateTransactionDTO,
        tx?: Prisma.TransactionClient
    ) {
        const client = tx ?? this.prisma;
        
        return client.$transaction(async (tx) => {
            const transaction = await this.getTransactionById(
                userId,
                transactionId,
                tx,
            );

            var categoryId = dto.categoryId ?? null;
            var accountId = dto.accountId ?? null;

            if (categoryId) {
                const category = await this.categoryService.getCategoryById(
                    userId,
                    categoryId,
                    tx
                );

                const newType = dto.type ?? transaction.type;

                if (category.type !== newType) {
                    throw new BadRequestException(
                        "Category type does not match transaction type",
                    );
                }
            }

            if (accountId) {
                await this.accountService.getAccountById(userId, accountId, tx);
            }

            await this.updateBalanceFromTransaction(userId, dto, transaction, tx);

            const updated = await tx.transaction.update({
                where: {
                    id: transactionId,
                },
                data: {
                    ...dto,
                    categoryId,
                    accountId,
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    amount: true,
                    type: true,
                    date: true,
                    userId: true,
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    account: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

            return updated;
        });
    }

    async updateBalanceFromTransaction(
        userId: string,
        newTransaction: UpdateTransactionDTO,
        oldTransaction: ResponseTransactionDTO,
        tx: Prisma.TransactionClient,
    ) {
        const newType = newTransaction.type ?? oldTransaction.type;
        const newAmount = newTransaction.amount ?? oldTransaction.amount;

        const oldAccountId = oldTransaction.account?.id ?? null;
        const newAccountId =
            newTransaction.accountId !== undefined
                ? newTransaction.accountId
                : oldAccountId;

        const accountChanged = newAccountId !== oldAccountId;
        const typeChanged = newType !== oldTransaction.type;
        const amountChanged = newAmount !== oldTransaction.amount;

        if (!accountChanged && !typeChanged && !amountChanged) return;

        const oldDelta = this.getDelta(
            oldTransaction.type,
            oldTransaction.amount,
        );
        const newDelta = this.getDelta(newType, newAmount);

        if (!accountChanged) {
            // same account
            if (!newAccountId) return;

            const diff = newDelta - oldDelta;
            if (diff !== 0) {
                await this.accountService.incrementAccountBalance(
                    userId,
                    newAccountId,
                    diff,
                    tx,
                );
            }

            return;
        }

        if (oldAccountId) {
            // if old account exists remove balance increment
            await this.accountService.incrementAccountBalance(
                userId,
                oldAccountId,
                -oldDelta,
                tx,
            );
        }

        if (newAccountId) {
            // if new account exists add balance increment
            await this.accountService.incrementAccountBalance(
                userId,
                newAccountId,
                newDelta,
                tx,
            );
        }
    }

    async deleteTransaction(userId: string, transactionId: string) {
        await this.getTransactionById(userId, transactionId);

        return this.prisma.$transaction(async (tx) => {
            const transaction = await this.getTransactionById(
                userId,
                transactionId,
                tx,
            );

            const accountId = transaction.account?.id ?? null;

            if (accountId) {
                const delta = this.getDelta(
                    transaction.type,
                    transaction.amount,
                );

                await this.accountService.incrementAccountBalance(
                    userId,
                    accountId,
                    -delta,
                    tx,
                );
            }

            return tx.transaction.delete({
                where: { id: transactionId },
            });
        });
    }
}
