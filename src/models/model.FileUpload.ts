import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './model.User';

/** document */
export interface IFileUpload extends Document {
  _id: string;
  name: string;
  url: string;
  user: Types.ObjectId | IUser['_id'];
  createdAt: Date;
  updatedAt: Date;
  location?: string;
}

const fileUploadSchema = new mongoose.Schema<IFileUpload>({
  name: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  location: String,
  url: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IFileUpload>('FileUpload', fileUploadSchema);
