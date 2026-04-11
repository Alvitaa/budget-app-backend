import { IsEmail, IsString } from "class-validator";

export class LoginDTO {
    @IsEmail({}, {message: "Email must be a valid email address"})
    email!: string;

    @IsString({message: "Password is required"})
    password!: string;
}
