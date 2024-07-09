import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Aggregate, Model } from 'mongoose';
import { User, UserDocument } from './schema/User';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await this.hashPassword(
        createUserDto.password,
        salt,
      );
      createUserDto.password = hashedPassword;
      createUserDto.salt = salt;
      const model = new this.userModel(createUserDto);
      return await model.save();
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Error creating user');
    }
  }

  findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  findOne(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  findUserFollowedTopics(id: string, user: any): Aggregate<any[]> {
    if (id != user.userId) {
      throw new UnauthorizedException();
    }
    return this.userModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'topics',
          localField: 'followedTopics',
          foreignField: '_id',
          as: 'followedTopics',
        },
      },
      {
        $unwind: '$followedTopics',
      },
      {
        $lookup: {
          from: 'questions',
          localField: 'followedTopics.questions',
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
  }

  async update(id: string, updateUserDto: UpdateUserDto, user: any) {
    if (id != user.userId) {
      throw new UnauthorizedException();
    }
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (updateUserDto.password) {
        updateUserDto.password = await this.hashPassword(
          updateUserDto.password,
          user.salt,
        );
      }

      return await this.userModel
        .findOneAndUpdate(
          { _id: id },
          {
            name: updateUserDto.name,
            age: updateUserDto.age,
            gender: updateUserDto.gender,
            email: updateUserDto.email,
            username: updateUserDto.username,
            password: updateUserDto.password,
            profilePicture: updateUserDto.profilePicture,
            followedTopics: updateUserDto.followedTopics,
          },
          { new: true }, // Use this option to return the modified document
        )
        .exec();
    } catch (error) {
      throw new Error('Error updating user');
    }
  }

  async remove(id: string, user: any) {
    try {
      if (id == user.userId)
        return await this.userModel.deleteOne({ _id: id }).exec();
      else throw new UnauthorizedException();
    } catch (error) {
      throw new Error('Error removing user');
    }
  }

  findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  getUserInfo(userId: string, user: any): Aggregate<any[]> {
    if (userId != user.userId) {
      throw new UnauthorizedException();
    }
    try {
      return this.userModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'topics',
            localField: 'followedTopics',
            foreignField: '_id',
            as: 'followedTopics',
          },
        },
        {
          $lookup: {
            from: 'questions',
            localField: '_id',
            foreignField: 'user',
            as: 'askedQuestions',
          },
        },
        {
          $lookup: {
            from: 'answers',
            localField: '_id',
            foreignField: 'user',
            as: 'answers',
          },
        },
        {
          $unwind: {
            path: '$askedQuestions',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'topics',
            localField: 'askedQuestions.topics',
            foreignField: '_id',
            as: 'askedQuestions.topics',
          },
        },
        {
          $group: {
            _id: '$_id',
            name: { $first: '$name' },
            age: { $first: '$age' },
            gender: { $first: '$gender' },
            email: { $first: '$email' },
            username: { $first: '$username' },
            profilePicture: { $first: '$profilePicture' },
            followedTopics: { $first: '$followedTopics' },
            askedQuestions: { $push: '$askedQuestions' },
            answers: { $push: '$answers' },
          },
        },
      ]);
    } catch (error) {
      console.error('Error retrieving user info:', error);
      throw new Error('Error retrieving user info');
    }
  }
  async hashPassword(password: string, salt: string): Promise<any> {
    try {
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword;
    } catch (error) {
      // Handle error (e.g., log it, throw a custom error, etc.)
      console.error('Error hashing password:', error);
      throw new Error('Error hashing password');
    }
  }
}
