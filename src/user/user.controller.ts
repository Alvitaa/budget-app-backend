import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
    Query,
} from "@nestjs/common";
import { UserService } from "./user.service";
import type { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { UserResponseDTO } from "./DTOs/UserResponse.dto";

@Controller("users")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get(":id")
    async getUserById(
        @Param("id", new ParseUUIDPipe()) id: string,
    ): Promise<UserResponseDTO | null> {
        return this.userService.user({ id });
    }

    @Get()
    async getAllUsers(): Promise<UserResponseDTO[]> {
        return this.userService.users({});
    }

    @Post()
    async createUser(
        @Body() data: { name: string; email: string; password: string },
    ): Promise<UserResponseDTO> {
        return this.userService.createUser(data);
    }

    @Put(":id")
    async updateUser(
        @Param("id", new ParseUUIDPipe()) id: string,
        @Body() data: User,
    ): Promise<UserResponseDTO> {
        return this.userService.updateUser({
            where: { id },
            data: data,
        });
    }

    @Delete(":id")
    @HttpCode(204)
    async deleteUserById(
        @Param("id", new ParseUUIDPipe()) id: string,
    ): Promise<void> {
        await this.userService.deleteUser({ id });
    }
}
