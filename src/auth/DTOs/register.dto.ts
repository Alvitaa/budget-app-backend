import { IsEmail, IsString, IsStrongPassword, MinLength } from 'class-validator'

export class RegisterDTO {
    @IsEmail({}, {message: "Email isn't a valid email address"})
    email!: string;

    @IsString({message: "Name is required"})
    name!: string;

    @IsString({message: "Password is required"})
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minUppercase: 1,
        minSymbols: 0
    },{message: "Password must be at least $constraint1 characters, have a Lowercase, an uppercase and at least one number"})
    password!: string;

    @IsString({message: "Please confirm your password"})
    @MinLength(8, {message: "Repeat Password must be at least 8 characters long and the same as password"})
    repeatPassword!: string;
}