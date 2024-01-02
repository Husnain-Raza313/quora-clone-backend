import { Injectable } from '@nestjs/common';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Answer, AnswerDocument } from './schema/Answer';
import { Model } from 'mongoose';

@Injectable()
export class AnswerService {
  constructor(
    @InjectModel(Answer.name) private answerModel: Model<AnswerDocument>,
  ) {}

  create(createAnswerDto: CreateAnswerDto): Promise<Answer> {
    const model = new this.answerModel();
    model.content = createAnswerDto.content;
    model.user = createAnswerDto.user;
    model.question = createAnswerDto.question;
    return model.save();
  }

  findAll(): Promise<Answer[]> {
    return this.answerModel.find().exec();
  }

  findOne(id: string): Promise<Answer> {
    return this.answerModel.findById(id).exec();
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

  remove(id: string) {
    return this.answerModel.deleteOne({ _id: id }).exec();
  }
}
