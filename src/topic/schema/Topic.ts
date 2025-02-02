import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TopicDocument = Topic & Document;

@Schema()
export class Topic extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  topicPicture: string;

  @Prop({ type: 'ObjectId', ref: 'User' })
  user: string;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);
