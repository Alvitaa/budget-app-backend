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
import { TransactionType } from "@prisma/client";
import { ResponseTransactionDTO } from "./DTOs/responseTransaction.dto";

@Injectable()
export class TransactionService {
    constructor(
        private prisma: PrismaService,
        private categoryService: CategoryService,
        private accountService: AccountService,
    ) {}

    private getDelta(type: TransactionType, amount: number): number {
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

    private async applyAccountEffect(
        userId: string,
        accountId: string,
        delta: number,
    ) {
        await this.accountService.incrementAccountBalance(
            userId,
            accountId,
            delta,
        );
    }

    async createTransaction(userId: string, dto: CreateTransactionDTO) {
        if (dto.categoryId) {
            const category = await this.categoryService.getCategoryById(
                userId,
                dto.categoryId,
            );
            if (category.type !== dto.type)
                throw new BadRequestException(
                    "Category type does not match transaction type",
                );
        }

        if (dto.accountId) {
            await this.accountService.getAccountById(userId, dto.accountId);

            const delta = this.getDelta(dto.type, dto.amount);

            await this.applyAccountEffect(userId, dto.accountId, delta);
        }

        return this.prisma.transaction.create({
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

    async getTransactions(userId: string, skip: number = 0) {
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
            orderBy: {
                date: "desc",
            },
            skip: skip,
        });
    }

    async getTransactionsByMonth(
        userId: string,
        year: number,
        month: number,
        skip: number = 0,
    ) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);

        return this.prisma.transaction.findMany({
            where: {
                userId,
                date: {
                    gte: start,
                    lte: end,
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
            skip: skip,
        });
    }

    async getTransactionById(userId: string, transactionId: string) {
        const transaction = await this.prisma.transaction.findFirst({
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

        return transaction;
    }

    async updateTransaction(
        userId: string,
        transactionId: string,
        dto: UpdateTransactionDTO,
    ) {
        const transaction = await this.getTransactionById(
            userId,
            transactionId,
        );

        var categoryId = dto.categoryId ?? null;
        var accountId = dto.accountId ?? null;

        if (userId !== transaction.userId) {
            throw new ForbiddenException(
                "Can't delete other user's transaction",
            );
        }

        console.log("userId:", userId)

        if (categoryId) {
            const category = await this.categoryService.getCategoryById(
                userId,
                categoryId,
            );
            if (category.type !== dto.type)
                throw new BadRequestException(
                    "Category type does not match transaction type",
                );
        }

        if (accountId) {
            await this.accountService.getAccountById(userId, accountId);
        }

        console.log("Trying updating account balance");
        await this.updateBalanceFromTransaction(userId, dto, transaction);

        return this.prisma.transaction.update({
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
    }

    async updateBalanceFromTransaction(
        userId: string,
        newTransaction: UpdateTransactionDTO,
        oldTransaction: ResponseTransactionDTO,
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
            if (diff != 0) {
                await this.applyAccountEffect(userId, newAccountId, diff);
            }

            return;
        }

        if (oldAccountId) {
            // if old account exists remove balance increment
            await this.applyAccountEffect(
                userId,
                oldAccountId,
                -oldDelta,
            );
        }

        if (newAccountId) {
            // if new account exists add balance increment
            await this.applyAccountEffect(userId, newAccountId, newDelta);
        }
    }

    async deleteTransaction(userId: string, transactionId: string) {
        const transaction = await this.getTransactionById(
            userId,
            transactionId,
        );

        if (userId !== transaction.userId) {
            throw new ForbiddenException(
                "Can't delete other user's transaction",
            );
        }

        return this.prisma.transaction.delete({
            where: {
                id: transactionId,
            },
        });
    }
}
