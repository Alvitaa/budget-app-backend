import { Module } from "@nestjs/common";
import { AccountController } from "./account.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { AccountService } from "./accounts.service";

@Module({
    controllers: [AccountController],
    providers: [AccountService],
    imports: [PrismaModule],
    exports: [AccountService]
})

export class AccountModule {}