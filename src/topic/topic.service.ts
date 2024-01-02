import { Injectable } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { Topic, TopicDocument } from './schema/Topic';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class TopicService {
  constructor(
    @InjectModel(Topic.name) private topicModel: Model<TopicDocument>,
  ) {}

  create(createTopicDto: CreateTopicDto): Promise<Topic> {
    const model = new this.topicModel();
    model.title = createTopicDto.title;
    model.description = createTopicDto.description;
    model.topicPicture = createTopicDto.topicPicture;
    model.user = createTopicDto.user;
    return model.save();
  }

  findAll(): Promise<Topic[]> {
    return this.topicModel.find().exec();
  }

  findOne(id: string): Promise<Topic> {
    return this.topicModel.findById(id).exec();
  }

  update(id: string, updateTopicDto: UpdateTopicDto) {
    return this.topicModel
      .updateOne(
        { _id: id },
        {
          title: updateTopicDto.title,
          description: updateTopicDto.description,
          topicPicture: updateTopicDto.topicPicture,
          user: updateTopicDto.user,
        },
      )
      .exec();
  }

  remove(id: string) {
    return this.topicModel.deleteOne({ _id: id }).exec();
  }
}
