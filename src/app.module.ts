import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { TopicModule } from './topic/topic.module';
import { QuestionModule } from './question/question.module';
import { AnswerModule } from './answer/answer.module';
import { LikeModule } from './like/like.module';
import { FollowModule } from './follow/follow.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    TopicModule,
    QuestionModule,
    AnswerModule,
    LikeModule,
    FollowModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
