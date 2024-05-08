import mongoose, { Document, Schema } from 'mongoose';

/** document */
export interface IUser extends Document {
    _id: string;
    username: string;
    email: string;
    password: string;
    name?: string;
    bio?: string;
    is_admin: boolean;
    is_superuser: boolean;
    is_active: boolean;
    profilePicture?: string;
    createdAt: Date;
    updatedAt: Date;
    followers: string[]; // Array of User IDs
    following: string[];
  }

 /** schema */
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: String,
  bio: String,
  profile_photo: String,
  is_admin: Boolean,
  is_superuser: Boolean,
  is_active: Boolean,
  profilePicture: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

export default mongoose.model<IUser>('User', userSchema);