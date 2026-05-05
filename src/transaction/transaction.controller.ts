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
import { TransactionService } from "./transaction.service";
import { CreateTransactionDTO } from "./DTOs/createTransaction.dto";
import { GetTransactionsDTO } from "./DTOs/getTransactions.dto";
import { UpdateTransactionDTO } from "./DTOs/updateTransaction.dto";

@UseGuards(JwtAuthGuard)
@Controller("transactions")
export class TransactionController {
    constructor(private transactionService: TransactionService) {}

    @Post()
    async createTransaction(@Req() req, @Body() body: CreateTransactionDTO) {
        const userId = req.user.id;
        return this.transactionService.createTransaction(userId, body);
    }

    @Get()
    async getTransactions(@Req() req, @Query() query: GetTransactionsDTO) {
        const userId = req.user.id;
        const { year, month, take, skip } = query;

        if (!year) {
            return this.transactionService.getTransactions(userId, take, skip)
        }

        return this.transactionService.getTransactionsByDate(userId, year, month, take, skip);
    }

    @Get(":id")
    async getTransaction(@Req() req, @Param("id") transactionId: string) {
        const userId = req.user.id;
        return this.transactionService.getTransactionById(
            userId,
            transactionId,
        );
    }

    @Patch(":id")
    async updateTransaction(
        @Req() req,
        @Param("id") transactionId: string,
        @Body() dto: UpdateTransactionDTO,
    ) {
        const userId = req.user.id;
        return this.transactionService.updateTransaction(
            userId,
            transactionId,
            dto,
        );
    }

    @Delete(":id")
    @HttpCode(204)
    async deleteTransaction(@Req() req, @Param("id") transactionId: string) {
        const userId = req.user.id;
        await this.transactionService.deleteTransaction(userId, transactionId);
    }
}
