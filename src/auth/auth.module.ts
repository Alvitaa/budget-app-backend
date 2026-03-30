import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserService } from "src/user/user.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { UserModule } from "src/user/user.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [
        PrismaModule,
        UserModule,
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
            signOptions: {expiresIn: "10min"},
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, UserService],
})

export class AuthModule {}