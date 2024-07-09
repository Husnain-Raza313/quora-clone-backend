import { Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Topic, TopicSchema } from './schema/Topic';
import { User, UserSchema } from 'src/user/schema/User';
import { Question, QuestionSchema } from 'src/question/schema/Question';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Topic.name, schema: TopicSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [TopicController],
  providers: [TopicService],
})
export class TopicModule {}
