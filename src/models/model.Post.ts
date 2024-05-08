import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './model.User';
import { ILike } from './model.Like';

/** document */
export interface IPost extends Document {
  _id: string;
  title: string;
  description: string;
  attachment?: string;
  author: Types.ObjectId | IUser['_id'];
  createdAt: Date;
  updatedAt: Date;
  privacySettings?: 'public' | 'hidden';
  sharesCount?: number;
  likesCount?: number;
  location?: string;
}

const postSchema = new mongoose.Schema<IPost>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  attachment: String,
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sharesCount: { type: Number, default: 0 },
  likesCount: { type: Number, default: 0 },
  location: String,
  privacySettings: {
    type: String,
    enum: ['public', 'hidden'],
    default: 'public'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPost>('Post', postSchema);
