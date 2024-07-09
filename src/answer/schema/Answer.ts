import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AnswerDocument = Answer & Document;

@Schema()
export class Answer extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ type: 'ObjectId', ref: 'User' })
  user: string;

  @Prop({ type: 'ObjectId', ref: 'Question' })
  question: string;

  @Prop({ type: [{ type: 'ObjectId', ref: 'User' }] })
  likedUsers: string[];

  @Prop({ type: [{ type: 'ObjectId', ref: 'User' }] })
  dislikedUsers: string[];
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);
