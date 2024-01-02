import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/User';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    const model = new this.userModel();
    model.name = createUserDto.name;
    model.age = createUserDto.age;
    model.gender = createUserDto.gender;
    model.email = createUserDto.email;
    model.username = createUserDto.username;
    model.profilePicture = createUserDto.profilePicture;
    return model.save();
  }

  findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  findOne(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userModel
      .updateOne(
        { _id: id },
        {
          name: updateUserDto.name,
          age: updateUserDto.age,
          gender: updateUserDto.gender,
          email: updateUserDto.email,
          username: updateUserDto.username,
          profilePicture: updateUserDto.profilePicture,
        },
      )
      .exec();
  }

  remove(id: string) {
    return this.userModel.deleteOne({ _id: id }).exec();
  }
}
