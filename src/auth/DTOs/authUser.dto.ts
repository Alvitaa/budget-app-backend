import { IsEmail, IsString } from "class-validator";

export class AuthUserDTO {
    @IsString()
    id: string;

    @IsEmail()
    email: string;

    @IsString()
    password: string;
}
