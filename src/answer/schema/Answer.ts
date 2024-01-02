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
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);
