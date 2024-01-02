import { IsEmail, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  age: number;

  @IsNotEmpty()
  gender: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  username: string;

  @IsUrl()
  @IsNotEmpty()
  profilePicture: string;
}
