import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { Prisma, TransactionType } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CategoryDTO } from "./DTOs/category.dto";
import { UpdateCategoryDTO } from "./DTOs/updateCategory.dto";
import { ResponseCategoryDTO } from "./DTOs/responseCategory.dto";

@Injectable()
export class CategoryService {
    constructor(private prisma: PrismaService) {}

    async createCategory(
        userId: string,
        dto: CategoryDTO,
    ): Promise<ResponseCategoryDTO> {
        try {
            return this.prisma.category.create({
                data: {
                    name: dto.name,
                    type: dto.type,
                    user: {
                        connect: { id: userId },
                    },
                },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    userId: true,
                },
            });
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === "P2002") {
                    throw new BadRequestException("Category already exists");
                }
            }
            throw e;
        }
    }

    async getCategories(
        userId: string,
        type?: TransactionType,
    ): Promise<ResponseCategoryDTO[]> {
        return this.prisma.category.findMany({
            where: {
                userId,
                ...(type && { type }),
            },
            orderBy: {
                name: "asc",
            },
            select: {
                id: true,
                name: true,
                type: true,
                userId: true,
            },
        });
    }

    async getCategoryById(
        userId: string,
        categoryId: string,
    ): Promise<ResponseCategoryDTO> {
        const category = await this.prisma.category.findFirst({
            where: {
                id: categoryId,
                userId,
            },
			select: {
				id: true,
                name: true,
                type: true,
                userId: true,
			}
        });

        if (!category) {
            throw new NotFoundException("Category not found");
        }

        return category;
    }

    async updateCategory(
        userId: string,
        categoryId: string,
        dto: UpdateCategoryDTO,
    ): Promise<ResponseCategoryDTO> {
        const category = await this.getCategoryById(userId, categoryId);

        if (userId !== category.userId) {
            throw new ForbiddenException("Can't update other user's category")
        }

        return this.prisma.category.update({
            where: {
                id: categoryId,
            },
            data: {
                ...dto,
            },
            select: {
                id: true,
                name: true,
                type: true,
                userId: true,
            },
        });
    }

    async deleteCategory(
        userId: string,
        categoryId: string,
    ): Promise<ResponseCategoryDTO> {
        const category = await this.getCategoryById(userId, categoryId);

        if (userId !== category.userId) {
            throw new ForbiddenException("Can't delete other user's category")
        }

        return this.prisma.category.delete({
            where: {
                id: categoryId,
            },
            select: {
                id: true,
                name: true,
                type: true,
                userId: true,
            },
        });
    }
}
