import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './model.User';
import { IPost } from './model.Post';

interface IShare extends Document {
  user: Types.ObjectId | IUser['_id'];
  post: Types.ObjectId | IPost['_id'];
}

const shareSchema = new Schema<IShare>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true  }
});

export default mongoose.model<IShare>('Share', shareSchema);
