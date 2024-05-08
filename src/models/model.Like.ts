// model/Like.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ILike extends Document {
  user: mongoose.Types.ObjectId; // ID of the user who liked the post
  post: mongoose.Types.ObjectId; // ID of the post that was liked
  createdAt: Date;
  updatedAt: Date;
}

const LikeSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ILike>('Like', LikeSchema);
