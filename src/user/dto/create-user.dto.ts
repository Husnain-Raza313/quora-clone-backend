import {
  IsArray,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsUrl,
} from 'class-validator';

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

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  salt: string;

  @IsUrl()
  @IsNotEmpty()
  profilePicture: string;

  @IsArray()
  @IsMongoId({ each: true })
  followedTopics: string[];
}
