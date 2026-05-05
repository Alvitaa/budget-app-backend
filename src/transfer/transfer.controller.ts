import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { TransferService } from "./transfer.service";
import { CreateTransferDTO } from "./DTOs/createTransfer.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { UpdateTransferDTO } from "./DTOs/updateTransfer.dto";
import { GetTransfersDTO } from "./DTOs/getTransfers.dto";

@UseGuards(JwtAuthGuard)
@Controller("transfers")
export class TransferController {
    constructor(private transferService: TransferService) {}

    @Get()
    async GetTransfers(@Req() req, @Query() query: GetTransfersDTO) {
        const userId = req.user.id;
        const { year, month, take, skip } = query;

        if (!year) {
            return this.transferService.getTransfers(userId, take, skip);
        }

        return this.transferService.getTransfersByDate(userId, year, month, take, skip);
    }

    @Post()
    async createTransfer(@Req() req, @Body() body: CreateTransferDTO) {
        const userId = req.user.id;
        return this.transferService.createTransfer(userId, body)
    }

    @Patch(":id")
    async updateTransfer(@Req() req, @Param("id") transferId: string, @Body() dto: UpdateTransferDTO) {
        const userId = req.user.id;
        return this.transferService.updateTransfer(userId, transferId, dto);
    }

    @Delete(":id")
    @HttpCode(204)
    async deleteTransfer(@Req() req, @Param("id") transferId: string) {
        const userId = req.user.id;
        await this.transferService.deleteTransfer(userId, transferId);
    }
}