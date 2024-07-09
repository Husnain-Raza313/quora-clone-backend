import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Answer, AnswerDocument } from './schema/Answer';
import mongoose, { Model } from 'mongoose';
import { Question, QuestionDocument } from 'src/question/schema/Question';

@Injectable()
export class AnswerService {
  constructor(
    @InjectModel(Answer.name) private answerModel: Model<AnswerDocument>,
    @InjectModel(Question.name)
    private readonly questionModel: Model<QuestionDocument>,
  ) {}

  async create(createAnswerDto: CreateAnswerDto): Promise<Answer> {
    try {
      const model = new this.answerModel(createAnswerDto);
      const savedAnswer = await model.save();

      await this.updateQuestionsAnswersArray(
        createAnswerDto.question,
        savedAnswer._id,
        'Add',
      );

      return savedAnswer;
    } catch (error) {
      console.error('Error creating answer:', error.message);
      throw new BadRequestException('Error creating answer');
    }
  }

  findAll(): Promise<Answer[]> {
    return this.answerModel.find().exec();
  }

  async findOne(id: string): Promise<Answer> {
    try {
      const answer = await this.answerModel.findById(id).exec();
      if (!answer) {
        throw new NotFoundException('Answer not found');
      }
      return answer;
    } catch (error) {
      console.error('Error finding answer:', error.message);
      throw new NotFoundException('Answer not found');
    }
  }

  update(id: string, updateAnswerDto: UpdateAnswerDto) {
    return this.answerModel
      .updateOne(
        { _id: id },
        {
          content: updateAnswerDto.content,
          user: updateAnswerDto.user,
          question: updateAnswerDto.question,
        },
      )
      .exec();
  }

  async remove(id: string) {
    try {
      const answer = await this.findOne(id);

      const response = answer.deleteOne({ _id: id }).exec();

      const questionId = answer.question;
      await this.updateQuestionsAnswersArray(questionId, id, 'Delete');

      return response;
    } catch (error) {
      console.error('Error removing answer:', error.message);
      throw new BadRequestException('Error removing answer');
    }
  }

  async likeAnswer(answerId: string, userId: string): Promise<Answer> {
    try {
      const answer = await this.answerModel.findById(answerId);

      if (!answer) {
        throw new NotFoundException('Answer not found');
      }

      answer.dislikedUsers = answer.dislikedUsers.filter(
        (dislikedUserId) => dislikedUserId != userId,
      );

      if (!answer.likedUsers.includes(userId)) {
        answer.likedUsers.push(userId);
      } else {
        answer.likedUsers = answer.likedUsers.filter(
          (likedUserId) => likedUserId != userId,
        );
      }

      return answer.save();
    } catch (error) {
      console.error('Error liking answer:', error.message);
      throw new BadRequestException('Error liking answer');
    }
  }

  async dislikeAnswer(answerId: string, userId: string): Promise<Answer> {
    try {
      const answer = await this.answerModel.findById(answerId);

      if (!answer) {
        throw new NotFoundException('Answer not found');
      }

      answer.likedUsers = answer.likedUsers.filter(
        (likedUserId) => likedUserId != userId,
      );

      if (!answer.dislikedUsers.includes(userId)) {
        answer.dislikedUsers.push(userId);
      } else {
        answer.dislikedUsers = answer.dislikedUsers.filter(
          (dislikedUserId) => dislikedUserId != userId,
        );
      }

      return answer.save();
    } catch (error) {
      console.error('Error disliking answer:', error.message);
      throw new BadRequestException('Error disliking answer');
    }
  }

  private async updateQuestionsAnswersArray(
    questionId: string,
    answerId: string,
    action: string,
  ): Promise<void> {
    try {
      await this.questionModel.updateOne(
        { _id: questionId },
        action === 'Add'
          ? { $addToSet: { answers: answerId } }
          : { $pull: { answers: answerId } },
      );
    } catch (error) {
      console.error(
        `Error updating questions' answers array: ${error.message}`,
      );
      throw new BadRequestException("Error updating questions' answers array");
    }
  }

  async getOthersInfo(userId: string): Promise<Answer[]> {
    try {
      const answers = await this.answerModel.find({
        user: new mongoose.Types.ObjectId(userId),
      });

      if (!answers || answers.length === 0) {
        return [];
      }

      const answerIds = answers.map((answer) => answer._id);

      const questions = await this.answerModel.aggregate([
        {
          $match: { _id: { $in: answerIds } },
        },
        {
          $lookup: {
            from: 'questions',
            localField: 'question',
            foreignField: '_id',
            as: 'question',
          },
        },
        {
          $unwind: '$question',
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: '$user',
        },
        {
          $group: {
            _id: '$user._id',
            user: { $first: '$user' },
            answeredQuestions: { $push: '$question' },
          },
        },
      ]);

      return questions;
    } catch (error) {
      console.error('Error getting others info:', error.message);
      throw new BadRequestException('Error getting others info');
    }
  }
}
