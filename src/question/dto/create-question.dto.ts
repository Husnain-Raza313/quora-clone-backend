import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateQuestionDto {
  @IsNotEmpty()
  content: string;

  @IsMongoId()
  @IsNotEmpty()
  topic: string;

  @IsMongoId()
  @IsNotEmpty()
  user: string;
}
