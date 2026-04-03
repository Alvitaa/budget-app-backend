import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { AccountService } from "./accounts.service";
import { CreateAccountDTO } from "./DTOs/createAccount.dto";
import { UpdateAccountDTO } from "./DTOs/updateAccount.dto";

@UseGuards(JwtAuthGuard)
@Controller("accounts")
export class AccountController {
    constructor(private accountService: AccountService) {}

    @Post()
    async createAccount(@Req() req, @Body() body: CreateAccountDTO) {
        const userId = req.user.id;
        return this.accountService.createAccount(userId, body)
    }

    @Get()
    async getAccounts(@Req() req) {
        const userId = req.user.id;
        return this.accountService.getAccounts(userId);
    }

    @Get(":id")
    async getAccountById(@Req() req, @Param("id") accountId: string) {
        const userId = req.user.id;
        return this.accountService.getAccountById(userId, accountId);
    }

    @Patch(":id")
    async updateAccount( @Req() req, @Param("id") accountId: string, @Body() dto: UpdateAccountDTO) {
        const userId = req.user.id;
        return this.accountService.updateAccount(userId, accountId, dto);
    }

    @Delete(":id")
    @HttpCode(204)
    async deleteAccount(@Req() req, @Param("id") accountId: string) {
        const userId = req.user.id;
        await this.accountService.deleteAccount(userId, accountId)
    }
}