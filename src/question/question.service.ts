import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from './schema/Question';
import { InjectModel } from '@nestjs/mongoose';
import { Topic, TopicDocument } from 'src/topic/schema/Topic';
import { AnswerService } from 'src/answer/answer.service';

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    @InjectModel(Topic.name) private topicModel: Model<TopicDocument>,
    private readonly answerService: AnswerService,
  ) {}

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    try {
      const createdQuestion = new this.questionModel(createQuestionDto);
      const savedQuestion = await createdQuestion.save();

      const topicIds = createQuestionDto.topics;
      await this.updateTopicsQuestionsArray(topicIds, savedQuestion._id, 'Add');

      return savedQuestion;
    } catch (error) {
      throw new BadRequestException('Error creating question');
    }
  }

  private async updateTopicsQuestionsArray(
    topicIds: string[],
    questionId: string,
    action: string,
  ): Promise<void> {
    try {
      const updateOperations =
        action === 'Add'
          ? { $addToSet: { questions: questionId } }
          : { $pull: { questions: questionId } };

      await Promise.all(
        topicIds.map(async (topicId) => {
          await this.topicModel
            .updateOne({ _id: topicId }, updateOperations)
            .exec();
        }),
      );
    } catch (error) {
      console.error(`Error updating topics' questions array: ${error.message}`);
      throw new BadRequestException("Error updating topics' questions array");
    }
  }

  async findOne(questionId: string): Promise<Question> {
    try {
      const question = await this.questionModel
        .findById(questionId)
        .populate('user')
        .populate('topics')
        .populate('answers');
      if (!question) {
        throw new NotFoundException('Question not found');
      }
      return question;
    } catch (error) {
      throw new NotFoundException('Error retrieving question');
    }
  }

  async remove(questionId: string): Promise<Question> {
    try {
      const question = await this.findOne(questionId);

      const response = await question.deleteOne({ _id: questionId }).exec();

      const topicIds = question.topics;
      await this.updateTopicsQuestionsArray(topicIds, questionId, 'Delete');
      await this.deleteRelatedAnswers(question.answers);

      return response;
    } catch (error) {
      throw new BadRequestException('Error removing question');
    }
  }

  async findAll(): Promise<Question[]> {
    try {
      return await this.questionModel
        .find()
        .populate('user')
        .populate('topics')
        .exec();
    } catch (error) {
      console.error('Error retrieving questions:', error);
      throw new NotFoundException('Error retrieving questions');
    }
  }

  async updateQuestionTopics(id: string, topicsToRemove: string[]) {
    try {
      await Promise.all(
        topicsToRemove.map(async (topicId) => {
          await this.topicModel
            .updateOne({ _id: topicId }, { $pull: { questions: id } })
            .exec();
        }),
      );
    } catch (error) {
      throw new BadRequestException('Error updating question topics');
    }
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    try {
      const response = await this.questionModel
        .updateOne(
          { _id: id },
          {
            content: updateQuestionDto.content,
            user: updateQuestionDto.user,
            topics: updateQuestionDto.topics,
            likedUsers: updateQuestionDto.likedUsers,
            dislikedUsers: updateQuestionDto.dislikedUsers,
          },
        )
        .exec();

      if (response && response.acknowledged) {
        await this.updateQuestionTopics(
          id,
          updateQuestionDto.topicsToRemove || [],
        );
      }

      return response;
    } catch (error) {
      throw new BadRequestException('Error updating question');
    }
  }

  async likeQuestion(questionId: string, userId: string): Promise<Question> {
    try {
      const question = await this.questionModel.findById(questionId);

      if (!question) {
        throw new NotFoundException('Question not found');
      }

      question.dislikedUsers = question.dislikedUsers.filter(
        (dislikedUserId) => dislikedUserId != userId,
      );

      if (!question.likedUsers.includes(userId)) {
        question.likedUsers.push(userId);
      } else {
        question.likedUsers = question.likedUsers.filter(
          (likedUserId) => likedUserId != userId,
        );
      }

      return question.save();
    } catch (error) {
      throw new BadRequestException('Error liking question');
    }
  }

  async dislikeQuestion(questionId: string, userId: string): Promise<Question> {
    try {
      const question = await this.questionModel.findById(questionId);

      if (!question) {
        throw new NotFoundException('Question not found');
      }

      question.likedUsers = question.likedUsers.filter(
        (likedUserId) => likedUserId != userId,
      );

      if (!question.dislikedUsers.includes(userId)) {
        question.dislikedUsers.push(userId);
      } else {
        question.dislikedUsers = question.dislikedUsers.filter(
          (dislikedUserId) => dislikedUserId != userId,
        );
      }

      return question.save();
    } catch (error) {
      throw new BadRequestException('Error disliking question');
    }
  }

  private async deleteRelatedAnswers(answerIds: string[]): Promise<void> {
    try {
      await Promise.all(
        answerIds.map(async (answerId) => {
          await this.answerService.remove(answerId);
        }),
      );
    } catch (error) {
      throw new BadRequestException('Error deleting related answers');
    }
  }
}
