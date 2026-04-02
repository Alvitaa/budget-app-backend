import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, TransactionType } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CategoryDTO } from "./DTOs/category.dto";
import { UpdateCategoryDTO } from "./DTOs/updateCategory.dto";

@Injectable()
export class CategoryService {
    constructor(private prisma: PrismaService) {}

    async createCategory(userId: string, dto: CategoryDTO) {
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
            },
        });
    }

  async getCategories(userId: string, type?: TransactionType) {
    return this.prisma.category.findMany({
      where: {
        userId,
        ...(type && { type }),
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getCategoryById(userId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async updateCategory(
    userId: string,
    categoryId: string,
    dto: UpdateCategoryDTO,
  ) {
    await this.getCategoryById(userId, categoryId);

    return this.prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteCategory(userId: string, categoryId: string) {
    await this.getCategoryById(userId, categoryId);

    return this.prisma.category.delete({
      where: {
        id: categoryId,
      },
    });
  }
}
