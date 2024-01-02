import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema()
export class Question extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ type: 'ObjectId', ref: 'User' })
  user: string;

  @Prop({ type: 'ObjectId', ref: 'Topic' })
  topic: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
