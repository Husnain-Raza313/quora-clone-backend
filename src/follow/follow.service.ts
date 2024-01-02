import { Injectable } from '@nestjs/common';
import { CreateFollowDto } from './dto/create-follow.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Follow, FollowDocument } from './schema/Follow';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
  ) {}

  create(createFollowDto: CreateFollowDto) {
    const model = new this.followModel();
    model.user = createFollowDto.user;
    model.topic = createFollowDto.topic;
    return model.save();
  }

  findAll() {
    return this.followModel.find().exec();
  }

  findOne(id: string) {
    return this.followModel.findById(id).exec();
  }

  remove(id: string) {
    return this.followModel.deleteOne({ _id: id }).exec();
  }
}
