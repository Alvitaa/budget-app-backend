import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserService } from "src/user/user.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { UserModule } from "src/user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { jwtConstants } from "src/constants";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./jwt.strategy";

@Module({
    imports: [
        PrismaModule,
        UserModule,
        PassportModule.register({defaultStrategy: "jwt"}),
        JwtModule.register({
            global: true,
            secret: jwtConstants.secret,
            signOptions: {expiresIn: "7d"},
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, UserService, JwtStrategy],
})

export class AuthModule {}