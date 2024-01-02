import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FollowDocument = Follow & Document;

@Schema()
export class Follow extends Document {
  @Prop({ type: 'ObjectId', ref: 'Topic' })
  topic: string;

  @Prop({ type: 'ObjectId', ref: 'User' })
  user: string;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);
