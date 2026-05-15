import mongoose, { Schema, Document } from 'mongoose';

export interface IMunicipalityCode extends Document {
  code: string;
  designatedTo?: string;
  isUsed: boolean;
  usedBy?: string; // email of the municipality that used it
  createdAt: Date;
}

const MunicipalityCodeSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true },
  designatedTo: { type: String, required: false },
  isUsed: { type: Boolean, default: false },
  usedBy: { type: String, required: false }
}, { timestamps: true });

export default mongoose.model<IMunicipalityCode>('MunicipalityCode', MunicipalityCodeSchema);
