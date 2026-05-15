import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'municipality' | 'admin';
  location?: { // Relevant for municipality
    lat: number;
    lng: number;
  };
  createdAt?: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Optional if using OAuth
  role: { type: String, enum: ['user', 'municipality', 'admin'], required: true, default: 'user' },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
