import { IsMongoId, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateTopicDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsUrl()
  @IsNotEmpty()
  topicPicture: string;

  @IsMongoId()
  @IsNotEmpty()
  user: string;
}
