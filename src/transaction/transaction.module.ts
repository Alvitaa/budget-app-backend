import { PrismaModule } from "src/prisma/prisma.module";
import { TransactionController } from "./transaction.controller";
import { TransactionService } from "./transaction.service";
import { Module } from "@nestjs/common";
import { CategoryModule } from "src/category/category.module";
import { AccountModule } from "src/account/account.module";

@Module({
    controllers: [TransactionController],
    providers: [TransactionService],
    imports: [PrismaModule, CategoryModule, AccountModule],
    exports: [TransactionService]
})

export class TransactionModule {}