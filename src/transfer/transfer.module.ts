import { Module } from "@nestjs/common";
import { TransferController } from "./transfer.controller";
import { TransferService } from "./transfer.service";
import { PrismaModule } from "../prisma/prisma.module";
import { TransactionModule } from "../transaction/transaction.module";
import { AccountModule } from "../account/account.module";

@Module({
    controllers: [TransferController],
    providers: [TransferService],
    imports: [PrismaModule, TransactionModule, AccountModule],
    exports: [TransferService]
})
export class TransferModule {}