import { Injectable } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { UserResponseDto } from "./DTOs/UserResponse.dto";

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async user(
        userWhereUniqueInput: Prisma.UserWhereUniqueInput,
    ): Promise<UserResponseDto | null> {
        return this.prisma.user.findUnique({
            where: userWhereUniqueInput,
            select: {
                email: true,
                name: true,
            },
        });
    }

    async users(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.UserWhereUniqueInput;
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationInput;
    }): Promise<UserResponseDto[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.user.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            select: {
                email: true,
                name: true,
            },
        });
    }

    async createUser(data: Prisma.UserCreateInput): Promise<UserResponseDto> {
        return this.prisma.user.create({
            data,
            select: {
                email: true,
                name: true,
            },
        });
    }

    async updateUser(params: {
        where: Prisma.UserWhereUniqueInput;
        data: Prisma.UserUpdateInput;
    }): Promise<UserResponseDto> {
        const { data, where } = params;
        return this.prisma.user.update({
            data,
            where,
            select: {
                email: true,
                name: true,
            },
        });
    }

    async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<UserResponseDto> {
        return this.prisma.user.delete({
            where,
            select: {
                email: true,
                name: true,
            },
        });
    }
}
