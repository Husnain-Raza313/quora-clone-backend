import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateTopicDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsUrl()
  @IsNotEmpty()
  topicPicture: string;

  @IsMongoId()
  @IsNotEmpty()
  user: string;

  @IsArray()
  @IsMongoId({ each: true })
  questions: string[];

  @IsArray()
  @IsMongoId({ each: true })
  followers: string[];
}
