import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { CategoryService } from "./category.service";
import { CategoryDTO } from "./DTOs/category.dto";
import { TransactionType } from "@prisma/client";
import { UpdateCategoryDTO } from "./DTOs/updateCategory.dto";

@UseGuards(JwtAuthGuard)
@Controller("categories")
export class CategoryController {
    constructor(private categoryService: CategoryService) {}

    @Post()
    createCategory(@Req() req, @Body() body: CategoryDTO) {
        return this.categoryService.createCategory(req.user.id, body);
    }

    @Get()
    async getCategories(@Req() req, @Query("type") type?: TransactionType) {
        const userId = req.user.id;
        return this.categoryService.getCategories(userId, type);
    }

    @Get(":id")
    async getCategoryById(@Req() req, @Param("id") categoryId: string) {
        const userId = req.user.id;
        return this.categoryService.getCategoryById(userId, categoryId);
    }

    @Patch(":id")
    async updateCategory(
        @Req() req,
        @Param("id") categoryId: string,
        @Body() dto: UpdateCategoryDTO,
    ) {
        const userId = req.user.id;
        return this.categoryService.updateCategory(userId, categoryId, dto);
    }

    @Delete(":id")
    async deleteCategory(@Req() req, @Param("id") categoryId: string) {
        const userId = req.user.id;
        return this.categoryService.deleteCategory(userId, categoryId);
    }
}
