import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import type { User } from "@prisma/client";
import bcrypt from 'bcryptjs';

@Controller("users")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get(":id")
    async getUserById(@Param("id") id: string): Promise<User | null> {
        return this.userService.user({id});
    }

	@Get()
    async getAllUsers(): Promise<User[]> {
        return this.userService.users({});
    }

    @Post()
    async createUser(
		@Body() data: {name: string, email: string, password: string}
	): Promise<User> {
        const hashedPassword = await bcrypt.hash(data.password, 12)
		return this.userService.createUser({
			...data,
			password: hashedPassword,
		});
    }

    @Post("id")
    async updateUser(@Param("id") id: string, @Body() data: User): Promise<User> {
        return this.userService.updateUser({
			where: {id},
			data: data
		});
    }

    @Delete(":id")
    async deleteUserById(@Param("id") id: string): Promise<User> {
        return this.userService.deleteUser({id});
    }
}
