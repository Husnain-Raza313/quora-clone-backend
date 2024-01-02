import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateAnswerDto {
  @IsNotEmpty()
  content: string;

  @IsMongoId()
  @IsNotEmpty()
  question: string;

  @IsMongoId()
  @IsNotEmpty()
  user: string;
}
