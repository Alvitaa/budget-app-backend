import { IsEmail, IsString } from "class-validator";

export class ValidatedUserDTO {
    @IsString()
    id: string;

    @IsEmail()
    email: string;
}
