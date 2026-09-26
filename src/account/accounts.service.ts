import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAccountDTO } from "./DTOs/createAccount.dto";
import { Prisma } from "@prisma/client";
import { ResponseAccountDTO } from "./DTOs/responseAccount.dto";
import { UpdateAccountDTO } from "./DTOs/updateAccount.dto";

@Injectable()
export class AccountService {
    constructor(private prisma: PrismaService) {}

    async createAccount(
        userId: string,
        dto: CreateAccountDTO,
    ): Promise<ResponseAccountDTO> {
        try {
            return this.prisma.$transaction(async (tx) => {
                const account = await tx.account.create({
                    data: {
                        ...dto,
                        user: {
                            connect: { id: userId },
                        },
                    },
                    select: {
                        id: true,
                        name: true,
                        balance: true,
                        isFavorite: true,
                        userId: true,
                    },
                });

                if (dto.isFavorite) this.toggleFavoriteAccount(userId, account.id, tx);

                return {
                    ...account,
                    balance: Number(account.balance)
                };
            })
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === "P2002") {
                    throw new BadRequestException("Account already exists");
                }
            }
            throw e;
        }
    }

    async getAccounts(userId: string): Promise<ResponseAccountDTO[]> {
        const accounts = await this.prisma.account.findMany({
            where: {
                userId,
            },
            orderBy: {
                name: "asc",
            },
            select: {
                id: true,
                name: true,
                balance: true,
                isFavorite: true,
                userId: true,
            },
        });

        return accounts.map((account) => ({
            ...account,
            balance: Number(account.balance)
        }));
    }

    async toggleFavoriteAccount(userId: string, accountId: string, tx: Prisma.TransactionClient, isFavorite: boolean = true) {
        if (isFavorite) {
            await tx.account.update({
                where: {
                    id: accountId,
                    userId
                },
                data: {
                    isFavorite: false,
                },
            })
            return;
        }

        await tx.account.updateMany({
            where: {
                userId,
                isFavorite: true,
            },
            data: {
                isFavorite: false,
            },
        });

        await tx.account.update({
            where: {
                id: accountId,
                userId,
            },
            data: {
                isFavorite: true,
            },
        });
    }

    async handleFavoriteAccount(userId: string, accountId: string) {
        await this.prisma.$transaction(async (tx) => {
            const account = await this.getAccountById(userId, accountId, tx);

            await this.toggleFavoriteAccount(userId, account.id, tx, account.isFavorite);
        })
    }

    async getAccountById(
        userId: string,
        accountId: string,
        tx?: Prisma.TransactionClient,
    ): Promise<ResponseAccountDTO> {
        const client = tx ?? this.prisma;

        const account = await client.account.findFirst({
            where: {
                id: accountId,
                userId,
            },
            select: {
                id: true,
                name: true,
                balance: true,
                isFavorite: true,
                userId: true,
            },
        });

        if (!account) throw new NotFoundException("Account not found");

        return {
            ...account,
            balance: Number(account.balance)
        };
    }

    async updateAccount(
        userId: string,
        accountId: string,
        dto: UpdateAccountDTO,
    ): Promise<ResponseAccountDTO> {
        const account = await this.getAccountById(userId, accountId);

        if (userId !== account.userId) {
            throw new ForbiddenException("Can't update other user's account");
        }

        return this.prisma.$transaction(async (tx) => {
            const updatedAccount = await tx.account.update({
                where: {
                    id: accountId,
                },
                data: {
                    ...dto,
                },
                select: {
                    id: true,
                    name: true,
                    balance: true,
                    isFavorite: true,
                    userId: true,
                },
            });

            if (dto.isFavorite) this.toggleFavoriteAccount(userId, accountId, tx, dto.isFavorite);

            return {
                ...updatedAccount,
                balance: Number(updatedAccount.balance)
            };
        })
    }

    async incrementAccountBalance(
        userId: string,
        accountId: string,
        delta: number,
        tx?: Prisma.TransactionClient,
    ) {
        const client = tx ?? this.prisma;
        const result = await client.account.updateMany({
            where: {
                id: accountId,
                userId,
            },
            data: {
                balance: {
                    increment: delta,
                },
            },
        });

        if (result.count === 0) {
            throw new ForbiddenException();
        }
    }

    async deleteAccount(
        userId: string,
        accountId: string,
    ) {
        const account = await this.getAccountById(userId, accountId);

        if (userId !== account.userId) {
            throw new ForbiddenException("Can't delete other user's account");
        }

        await this.prisma.account.delete({
            where: {
                id: accountId,
            },
            select: {
                id: true,
                name: true,
                balance: true,
                userId: true,
            },
        });

        return { success: true };
    }
}
