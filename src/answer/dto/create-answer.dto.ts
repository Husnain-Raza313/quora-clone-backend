import { IsArray, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAnswerDto {
  @IsNotEmpty()
  content: string;

  @IsMongoId()
  @IsNotEmpty()
  question: string;

  @IsMongoId()
  @IsNotEmpty()
  user: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  likedUsers?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  dislikedUsers?: string[];
}
