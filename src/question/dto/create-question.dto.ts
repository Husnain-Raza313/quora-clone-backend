import { IsArray, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateQuestionDto {
  @IsNotEmpty()
  content: string;

  @IsMongoId()
  @IsNotEmpty()
  user: string;

  @IsArray()
  @IsMongoId({ each: true })
  topics: string[];

  @IsArray()
  @IsMongoId({ each: true })
  answers: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  likedUsers?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  dislikedUsers?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  topicsToRemove?: string[];
}
