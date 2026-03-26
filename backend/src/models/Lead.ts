import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  jobId: string;
  name: string;
  title: string;
  company: string;
  linkedinUrl?: string;
  email?: string;
  website?: string;
  techStack?: string[];
  about?: string;
  industry?: string;
  location?: string;
  score?: number;
  enriched?: boolean; // Tracking if targeted enrichment was performed
  createdAt: Date;
}

const LeadSchema: Schema = new Schema({
  jobId: { type: String, required: true },
  name: { type: String, required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  linkedinUrl: { type: String },
  email: { type: String },
  website: { type: String },
  techStack: [{ type: String }],
  about: { type: String },
  industry: { type: String },
  location: { type: String },
  score: { type: Number, default: 0 },
  enriched: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
