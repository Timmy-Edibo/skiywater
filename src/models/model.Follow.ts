import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './model.User';
import { ILike } from './model.Like';

/** document */
export interface IFollow extends Document {
  _id: string;
  follower: Types.ObjectId | IUser['_id'];
  following: Types.ObjectId | IUser['_id'];
  status: 'pending' | 'active'; // Status of the follow relationship (e.g., "active", "pending")
  createdAt: Date;
  updatedAt: Date;
}

const followSchema = new mongoose.Schema<IFollow>({
  follower: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  following: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, required: true, default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IFollow>('Follow', followSchema);
