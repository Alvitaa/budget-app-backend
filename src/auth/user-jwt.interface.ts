import { ValidatedUserDTO } from "./DTOs/validatedUser.dto";

export interface UserJwtResponse {
    user: ValidatedUserDTO;
    accessToken: string;
}