import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { RegisterDTO } from "./DTOs/register.dto";
import { LoginDTO } from "./DTOs/login.dto";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { UserJwtResponse } from "./user-jwt.interface";
import { ResponseUserDTO } from "src/user/DTOs/responseUser.dto";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) {}

    async validateUserByEmail(userEmail: string): Promise<ResponseUserDTO | null> {
        return await this.userService.user({email: userEmail});
    }

    async register(dto: RegisterDTO): Promise<UserJwtResponse> {
        const existing = await this.userService.getUserByEmail(dto.email)

        if (existing) throw new BadRequestException("Email already in use.");

        if (dto.password != dto.repeatPassword)
            throw new BadRequestException("Passwords don't match.");

        const hashedPassword = await bcrypt.hash(dto.password, 12);
        const user = await this.userService.createUser({
            name: dto.name,
            email: dto.email,
            password: hashedPassword,
        });

        const {name, ...result} = user;
        const payload = { result };
        const accessToken = await this.jwtService.signAsync(payload)

        const registeredResponse = { user: result, accessToken };
        return registeredResponse;
    }

    async login(dto: LoginDTO): Promise<UserJwtResponse> {
        const user = await this.userService.getUserByEmail(dto.email)

        if (!user) throw new UnauthorizedException("Invalid credentials.");

        const valid = await bcrypt.compare(dto.password, user.password);

        if (!valid) throw new UnauthorizedException("Invalid credentials.");

        const {password, ...result} = user;
        const payload = { result };
        const accessToken = await this.jwtService.signAsync(payload)

        const signInResponse = { user: result, accessToken };
        return signInResponse;
    }
}
