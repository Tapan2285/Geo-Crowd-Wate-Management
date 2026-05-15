import mongoose, { Schema, Document } from 'mongoose';

export interface IComplaint extends Document {
  imageUrl: string;
  location: {
    lat: number;
    lng: number;
  };
  address?: string;
  description: string;
  userId: string;
  status: string;
  aiValidation: {
    is_waste: boolean;
    confidence: number;
    message: string;
  };
  assignedMunicipalityId: string;
  feedback?: string;
  createdAt: Date;
}

const ComplaintSchema: Schema = new Schema({
  imageUrl: { type: String, required: false },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  address: { type: String, required: false },
  description: { type: String, default: '' },
  userId: { type: String, required: true },
  status: { type: String, default: 'Reported' },
  aiValidation: {
    is_waste: { type: Boolean, required: true },
    confidence: { type: Number, required: true },
    message: { type: String, default: '' }
  },
  assignedMunicipalityId: { type: String, required: true },
  feedback: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IComplaint>('Complaint', ComplaintSchema);
