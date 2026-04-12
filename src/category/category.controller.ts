import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { CategoryService } from "./category.service";
import { CategoryDTO } from "./DTOs/category.dto";
import { UpdateCategoryDTO } from "./DTOs/updateCategory.dto";
import { GetCategoryDTO } from "./DTOs/getCategory.dto";

@UseGuards(JwtAuthGuard)
@Controller("categories")
export class CategoryController {
    constructor(private categoryService: CategoryService) {}

    @Post()
    async createCategory(@Req() req, @Body() body: CategoryDTO) {
        return this.categoryService.createCategory(req.user.id, body);
    }

    @Get()
    async getCategories(@Req() req, @Query() query: GetCategoryDTO) {
        const userId = req.user.id;
        return this.categoryService.getCategories(userId, query.type);
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
    @HttpCode(204)
    async deleteCategory(@Req() req, @Param("id") categoryId: string) {
        const userId = req.user.id;
        await this.categoryService.deleteCategory(userId, categoryId);
    }
}
