import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  query: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  totalFound: number;
  params?: any; // Structured params from Gemini
  logs: string[];
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema({
  query: { type: String, required: true },
  status: { type: String, enum: ['pending', 'running', 'completed', 'failed'], default: 'pending' },
  totalFound: { type: Number, default: 0 },
  params: { type: Schema.Types.Mixed },
  logs: [{ type: String }],
}, { timestamps: true });

export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
