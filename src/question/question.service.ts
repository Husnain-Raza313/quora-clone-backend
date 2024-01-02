import { Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from './schema/Question';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
  ) {}
  create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const model = new this.questionModel();
    model.content = createQuestionDto.content;
    model.user = createQuestionDto.user;
    model.topic = createQuestionDto.topic;
    return model.save();
  }

  findAll(): Promise<Question[]> {
    return this.questionModel.find().exec();
  }

  findOne(id: string): Promise<Question> {
    return this.questionModel.findById(id).exec();
  }

  update(id: string, updateQuestionDto: UpdateQuestionDto) {
    return this.questionModel
      .updateOne(
        { _id: id },
        {
          content: updateQuestionDto.content,
          user: updateQuestionDto.user,
          topic: updateQuestionDto.topic,
        },
      )
      .exec();
  }

  remove(id: string) {
    return this.questionModel.deleteOne({ _id: id }).exec();
  }
}
