import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from './schema/Question';
import { Topic, TopicSchema } from 'src/topic/schema/Topic';
import { AnswerService } from 'src/answer/answer.service';
import { Answer, AnswerSchema } from 'src/answer/schema/Answer';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: Topic.name, schema: TopicSchema },
      { name: Answer.name, schema: AnswerSchema },
    ]),
  ],
  controllers: [QuestionController],
  providers: [QuestionService, AnswerService],
})
export class QuestionModule {}
