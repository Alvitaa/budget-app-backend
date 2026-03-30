import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDTO } from "./DTOs/register.dto";
import { LoginDTO } from "./DTOs/login.dto";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("register")
    async register(@Body() dto: RegisterDTO) {
        return this.authService.register(dto);
    }

    @Post("login")
    async login(@Body() dto: LoginDTO) {
        return this.authService.login(dto);
    }
}
