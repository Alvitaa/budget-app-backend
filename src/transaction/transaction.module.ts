import { PrismaModule } from "../prisma/prisma.module";
import { TransactionController } from "./transaction.controller";
import { TransactionService } from "./transaction.service";
import { Module } from "@nestjs/common";
import { CategoryModule } from "../category/category.module";
import { AccountModule } from "../account/account.module";

@Module({
    controllers: [TransactionController],
    providers: [TransactionService],
    imports: [PrismaModule, CategoryModule, AccountModule],
    exports: [TransactionService]
})

export class TransactionModule {}