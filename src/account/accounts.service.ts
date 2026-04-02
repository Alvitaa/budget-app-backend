import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
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
            },
        });
    }

    async getAccountById(userId: string, accountId: string): Promise<ResponseAccountDTO> {
        const account = await this.prisma.account.findFirst({
            where: {
                id: accountId,
                userId
            },
            select: {
                id: true,
                name: true,
                balance: true,
            }
        });

        if (!account) throw new NotFoundException("Account not found");

        return account;
    }

    async updateAccount(userId: string, accountId: string, dto: UpdateAccountDTO): Promise<ResponseAccountDTO> {
        await this.getAccountById(userId, accountId);

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
            }
        })
    }

    async deleteAccount(userId: string, accountId: string): Promise<ResponseAccountDTO> {
        await this.getAccountById(userId, accountId);

        return this.prisma.account.delete({
            where: {
                id: accountId,
            },
            select: {
                id: true,
                name: true,
                balance: true,
            }
        })
    }
}
