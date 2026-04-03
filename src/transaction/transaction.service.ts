import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateTransactionDTO } from "./DTOs/createTransaction.dto";
import { CategoryService } from "src/category/category.service";
import { AccountService } from "src/account/accounts.service";
import { UpdateTransactionDTO } from "./DTOs/updateTransaction.dto";
import { GetTransactionsDTO } from "./DTOs/getTransactions.dto";

@Injectable()
export class TransactionService {
    constructor(
        private prisma: PrismaService,
        private categoryService: CategoryService,
        private accountService: AccountService,
    ) {}

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
        }

        return this.prisma.transaction.create({
            data: {
                ...dto,
                date: new Date(dto.date),
                userId,
            },
            include: {
                category: true,
                account: true,
            },
        });
    }

    async getTransactionsByMonth(userId: string, dto: GetTransactionsDTO) {
        const start = new Date(dto.year, dto.month - 1, 1);
        const end = new Date(dto.year, dto.month, 0);

        return this.prisma.transaction.findMany({
            where: {
                userId,
                date: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                category: true,
                account: true,
            },
            orderBy: {
                date: "desc",
            },
            take: 20,
            skip: dto.skip
        })
    }

    async getTransactionById(userId: string, transactionId: string) {
        const transaction = await this.prisma.transaction.findFirst({
            where: {
                id: transactionId,
                userId,
            }
        })

        if (!transaction) throw new NotFoundException("Transaction not found");

        return transaction;
    }

    async updateTransaction(userId: string, transactionId: string, dto: UpdateTransactionDTO) {
        const transaction = await this.getTransactionById(userId, transactionId);

        if (userId !== transaction.userId) {
            throw new ForbiddenException("Can't delete other user's transaction")
        }

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
        }

        return this.prisma.transaction.update({
            where: {
                id: transactionId,
            },
            data: dto,
            include: {
                category: true,
                account: true,
            },
        })
    }

    async deleteTransaction(userId: string, transactionId: string) {
        const transaction = await this.getTransactionById(userId, transactionId);

        if (userId !== transaction.userId) {
            throw new ForbiddenException("Can't delete other user's transaction")
        }

        return this.prisma.user.delete({
            where: {
                id: transactionId
            }
        })
    }
}
