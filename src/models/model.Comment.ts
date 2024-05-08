import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './model.User';
import { IPost } from './model.Post';

interface IComment extends Document {
  content: string;
  user: Types.ObjectId | IUser['_id'];
  post: Types.ObjectId | IPost['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
  content: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IComment>('Comment', commentSchema);
