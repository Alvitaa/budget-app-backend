import { IsEmail, IsString } from 'class-validator'

export class UserResponseDTO {
  @IsEmail()
  email: string

  @IsString()
  name: string
}