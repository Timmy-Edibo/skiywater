import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './model.User';
import { IPost } from './model.Post';

export interface IReaction extends Document {
  type: string;
  user: Types.ObjectId | IUser['_id'];
  post: Types.ObjectId | IPost['_id'];
  count?: number;
}

// Define models for like, share, and comment interactions
const reactionSchema = new Schema<IReaction>({
  type: { type: String, required: true }, // Example: like, wow, laugh, etc.
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  count: { type: Number, default: 0 }
});

export default mongoose.model<IReaction>('Reaction', reactionSchema);
