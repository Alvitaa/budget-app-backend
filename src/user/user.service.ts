import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthUserDTO } from "src/auth/DTOs/authUser.dto";
import { ResponseUserDTO } from "./DTOs/responseUser.dto";
import { UpdateUserDTO } from "./DTOs/updateUser.dto";
import { CreateUserDTO } from "./DTOs/createUser.dto";

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async user(
        userWhereUniqueInput: Prisma.UserWhereUniqueInput,
    ): Promise<ResponseUserDTO> {
        const user = await this.prisma.user.findUnique({
            where: userWhereUniqueInput,
            select: {
                id: true,
                email: true,
                name: true,
            },
        });

        if (!user) throw new NotFoundException("User not found");

        return user;
    }

    async users(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.UserWhereUniqueInput;
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationInput;
    }): Promise<ResponseUserDTO[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.user.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            select: {
                id: true,
                email: true,
                name: true,
            },
        });
    }

    async getUserByEmail(email: string): Promise<AuthUserDTO | null> {
        return this.prisma.user.findUnique({
            where: {
                email
            },
            select: {
                id: true,
                email: true,
                password: true,
            },
        });
    }

    async createUser(dto: CreateUserDTO): Promise<ResponseUserDTO> {
        return this.prisma.user.create({
            data: dto,
            select: {
                id: true,
                email: true,
                name: true,
            },
        });
    }

    async updateUser(id: string, userId: string, dto: UpdateUserDTO): Promise<ResponseUserDTO> {
        if (userId !== id){
            throw new ForbiddenException("You can't update this user");
        }

        await this.user({ id });

        return this.prisma.user.update({
            where: {
                id
            },
            data: dto,
            select: {
                id: true,
                email: true,
                name: true,
            },
        });
    }

    async deleteUser(id: string, userId: string): Promise<ResponseUserDTO> {
        if (userId !== id){
            throw new ForbiddenException("You can't delete this user");
        }

        await this.user({ id });

        return this.prisma.user.delete({
            where: {
                id
            },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });
    }
}
