import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateLikeDto {
  @IsNotEmpty()
  type: string;

  @IsMongoId()
  @IsNotEmpty()
  typeId: string;

  @IsMongoId()
  @IsNotEmpty()
  user: string;
}
