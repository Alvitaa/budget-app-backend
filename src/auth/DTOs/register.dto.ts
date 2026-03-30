import { IsEmail, IsString, IsStrongPassword, MinLength } from 'class-validator'

export class RegisterDTO {
    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @IsString()
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minUppercase: 1,
        minSymbols: 0
    })
    password: string;

    @IsString()
    @MinLength(8)
    repeatPassword: string;
}