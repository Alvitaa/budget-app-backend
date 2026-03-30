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
import { AuthUserDTO } from "./DTOs/authUser.dto";
import { UserWithIdDTO } from "src/user/DTOs/UserResponseWithId.dto";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) {}

    async register(dto: RegisterDTO): Promise<UserWithIdDTO> {
        const existing = await this.userService.getUserByEmail({email: dto.email})

        if (existing) throw new BadRequestException("Email already in use.");

        if (dto.password != dto.repeatPassword)
            throw new BadRequestException("Passwords don't match.");

        const hashedPassword = await bcrypt.hash(dto.password, 12);
        const user = await this.userService.createUser({
            name: dto.name,
            email: dto.email,
            password: hashedPassword,
        });

        return {
            id: user.id,
            email: user.email,
            name: user.name,
        };
    }

    async login(dto: LoginDTO): Promise<{ access_token: string }> {
        const user = await this.userService.getUserByEmail({email: dto.email})

        if (!user) throw new UnauthorizedException("Invalid credentials.");

        const valid = await bcrypt.compare(dto.password, user.password);

        if (!valid) throw new UnauthorizedException("Invalid credentials.");

        const payload = { userId: user.id };

        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }
}
