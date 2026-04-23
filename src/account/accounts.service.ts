import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
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
            return this.prisma.account.create({
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
                    userId: true,
                },
            });
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
        return this.prisma.account.findMany({
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
                userId: true,
            },
        });
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
                userId: true,
            },
        });

        if (!account) throw new NotFoundException("Account not found");

        return account;
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

        return this.prisma.account.update({
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
                userId: true,
            },
        });
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
    ): Promise<ResponseAccountDTO> {
        const account = await this.getAccountById(userId, accountId);

        if (userId !== account.userId) {
            throw new ForbiddenException("Can't delete other user's account");
        }

        return this.prisma.account.delete({
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
    }
}
