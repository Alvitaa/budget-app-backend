import { IsString } from "class-validator";

export class UserWithIdDTO {
  @IsString()
  id: string;

  @IsString()
  email: string;

  @IsString()
  name: string;
}