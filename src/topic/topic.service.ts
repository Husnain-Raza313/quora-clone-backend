import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { Topic, TopicDocument } from './schema/Topic';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Aggregate, Model } from 'mongoose';
import { User, UserDocument } from 'src/user/schema/User';
import { Question, QuestionDocument } from 'src/question/schema/Question';

@Injectable()
export class TopicService {
  constructor(
    @InjectModel(Topic.name) private topicModel: Model<TopicDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
  ) {}

  async create(createTopicDto: CreateTopicDto): Promise<Topic> {
    try {
      console.log(createTopicDto);
      const createdTopic = new this.topicModel(createTopicDto);
      const savedTopic = await createdTopic.save();
      return savedTopic;
    } catch (error) {
      throw new BadRequestException('Error creating topic');
    }
  }

  async findAll(): Promise<Topic[]> {
    try {
      return this.topicModel
        .find()
        .populate('user')
        .populate('followers')
        .exec();
    } catch (error) {
      throw new NotFoundException('Error retrieving topics');
    }
  }

  async findOne(topicId: string): Promise<Topic> {
    try {
      const topic = await this.topicModel.findById(topicId);
      if (!topic) {
        throw new NotFoundException('Topic not found');
      }
      return topic;
    } catch (error) {
      console.error('Error retrieving topic:', error);
      throw new NotFoundException('Error retrieving topic');
    }
  }

  findQuestionsByTopic(topicId: string): Aggregate<any[]> {
    try {
      return this.topicModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(topicId) } },
        {
          $lookup: {
            from: 'questions',
            localField: 'questions',
            foreignField: '_id',
            as: 'questions',
          },
        },
        {
          $unwind: '$questions',
        },
        {
          $lookup: {
            from: 'topics',
            localField: 'questions.topics',
            foreignField: '_id',
            as: 'questions.topics',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'questions.user',
            foreignField: '_id',
            as: 'questions.user',
          },
        },
        {
          $addFields: {
            'questions.user': { $arrayElemAt: ['$questions.user', 0] },
          },
        },
        {
          $lookup: {
            from: 'answers',
            localField: 'questions._id',
            foreignField: 'question',
            as: 'questions.answers',
          },
        },
        {
          $unwind: {
            path: '$questions.answers',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'questions.answers.user',
            foreignField: '_id',
            as: 'questions.answers.user',
          },
        },
        {
          $addFields: {
            'questions.answers.user': {
              $arrayElemAt: ['$questions.answers.user', 0],
            },
          },
        },
        {
          $group: {
            _id: '$questions._id',
            content: { $first: '$questions.content' },
            likedUsers: { $first: '$questions.likedUsers' },
            dislikedUsers: { $first: '$questions.dislikedUsers' },
            user: { $first: '$questions.user' },
            topics: { $first: '$questions.topics' },
            answers: { $push: '$questions.answers' },
          },
        },
        {
          $replaceRoot: {
            newRoot: {
              _id: '$_id',
              content: '$content',
              likedUsers: '$likedUsers',
              dislikedUsers: '$dislikedUsers',
              user: '$user',
              topics: '$topics',
              answers: '$answers',
            },
          },
        },
      ]);
    } catch (error) {
      console.error('Error retrieving questions by topic:', error);
      throw new NotFoundException('Error retrieving questions by topic');
    }
  }

  update(id: string, updateTopicDto: UpdateTopicDto) {
    try {
      return this.topicModel
        .updateOne(
          { _id: id },
          {
            title: updateTopicDto.title,
            description: updateTopicDto.description,
            topicPicture: updateTopicDto.topicPicture,
            user: updateTopicDto.user,
            questions: updateTopicDto.questions,
          },
        )
        .exec();
    } catch (error) {
      console.error('Error updating topic:', error);
      throw new BadRequestException('Error updating topic');
    }
  }

  async remove(topicId: string): Promise<Topic> {
    try {
      const topic = await this.findOne(topicId);

      const userIds = topic.followers;
      const questionIds = topic.questions;
      await this.updateUsersTopicsArray(userIds, topicId, 'Delete');
      await this.removeTopicFromQuestions(topicId, questionIds);

      const response = await topic.deleteOne({ _id: topicId }).exec();
      return response;
    } catch (error) {
      throw new BadRequestException('Error removing topic');
    }
  }

  async followTopic(userId: string, topicId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    const topic = await this.topicModel.findById(topicId);

    if (!user || !topic) {
      throw new NotFoundException('User or Topic not found');
    }

    if (!user.followedTopics.includes(topicId)) {
      user.followedTopics.push(topicId);
      await user.save();
      topic.followers.push(userId);
      await topic.save();
    }

    return user;
  }

  async unfollowTopic(userId: string, topicId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    const topic = await this.topicModel.findById(topicId);

    if (!user || !topic) {
      throw new NotFoundException('User or Topic not found');
    }

    const topicIndex = user.followedTopics.indexOf(topicId);
    if (topicIndex !== -1) {
      user.followedTopics.splice(topicIndex, 1);
      await user.save();

      const userIndex = topic.followers.indexOf(userId);
      if (userIndex !== -1) {
        topic.followers.splice(userIndex, 1);
        await topic.save();
      }
    }

    return user;
  }

  private async updateUsersTopicsArray(
    userIds: string[],
    topicId: string,
    action: string,
  ): Promise<void> {
    for (const userId of userIds) {
      await this.userModel.updateOne(
        { _id: userId },
        action === 'Add'
          ? { $addToSet: { topics: topicId } }
          : { $pull: { topics: topicId } },
      );
    }
  }

  private async removeTopicFromQuestions(
    topicId: string,
    questionIds: string[],
  ): Promise<void> {
    for (const questionId of questionIds) {
      try {
        const question = await this.questionModel.findById(questionId);

        if (question) {
          question.topics = question.topics.filter(
            (topic) => topic.toString() !== topicId,
          );

          if (question.topics.length === 0) {
            await this.questionModel.deleteOne({ _id: questionId }).exec();
          } else {
            await question.save();
          }
        }
      } catch (error) {
        console.error(
          `Error processing question ${questionId}: ${error.message}`,
        );
      }
    }
  }
}
