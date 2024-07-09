import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema()
export class Question extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ type: 'ObjectId', ref: 'User' })
  user: string;

  @Prop({ type: [{ type: 'ObjectId', ref: 'Topic' }] })
  topics: string[];

  @Prop({ type: [{ type: 'ObjectId', ref: 'User' }] })
  likedUsers: string[];

  @Prop({ type: [{ type: 'ObjectId', ref: 'Answer' }] })
  answers: string[];

  @Prop({ type: [{ type: 'ObjectId', ref: 'User' }] })
  dislikedUsers: string[];
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
