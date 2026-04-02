import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    HttpCode,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import type { User } from "@prisma/client";
import { ResponseUserDTO } from "./DTOs/responseUser.dto";
import { UpdateUserDTO } from "./DTOs/updateUser.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@Controller("users")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get(":id")
    async getUserById(
        @Param("id", new ParseUUIDPipe()) id: string,
    ): Promise<ResponseUserDTO> {
        return this.userService.user({ id });
    }

    @Get()
    async getAllUsers(): Promise<ResponseUserDTO[]> {
        return this.userService.users({});
    }

    @Post()
    async createUser(
        @Body() data: { name: string; email: string; password: string },
    ): Promise<ResponseUserDTO> {
        return this.userService.createUser(data);
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard)
    async updateUser(
        @Req() req,
        @Param("id", new ParseUUIDPipe()) id: string,
        @Body() dto: UpdateUserDTO,
    ): Promise<ResponseUserDTO> {
        const userId = req.user.id

        return this.userService.updateUser(id, userId, dto);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard)
    @HttpCode(204)
    async deleteUser(@Req() req, @Param("id", new ParseUUIDPipe()) id: string) {
        const userId = req.user.id

        await this.userService.deleteUser(id, userId);
    }
}
