import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateFollowDto {
  @IsMongoId()
  @IsNotEmpty()
  user: string;

  @IsMongoId()
  @IsNotEmpty()
  topic: string;
}
