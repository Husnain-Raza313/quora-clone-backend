import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LikeDocument = Like & Document;

@Schema()
export class Like extends Document {
  @Prop({ required: true, enum: ['Question', 'Answer'] })
  type: string;

  @Prop({ required: true })
  typeId: string;

  @Prop({ type: 'ObjectId', ref: 'User' })
  user: string;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
