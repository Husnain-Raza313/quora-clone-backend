import { Injectable } from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like, LikeDocument } from './schema/Like';

@Injectable()
export class LikeService {
  constructor(@InjectModel(Like.name) private likeModel: Model<LikeDocument>) {}

  create(createLikeDto: CreateLikeDto): Promise<Like> {
    const model = new this.likeModel();
    model.type = createLikeDto.type;
    model.user = createLikeDto.user;
    model.typeId = createLikeDto.typeId;
    return model.save();
  }

  findAll(): Promise<Like[]> {
    return this.likeModel.find().exec();
  }

  findOne(id: string): Promise<Like> {
    return this.likeModel.findById(id).exec();
  }

  update(id: string, updateLikeDto: UpdateLikeDto) {
    return this.likeModel
      .updateOne(
        { _id: id },
        {
          type: updateLikeDto.type,
          user: updateLikeDto.user,
          typeId: updateLikeDto.typeId,
        },
      )
      .exec();
  }

  remove(id: string) {
    return this.likeModel.deleteOne({ _id: id }).exec();
  }
}
