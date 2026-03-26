import mongoose, { Schema, Document } from 'mongoose';
const LeadSchema = new Schema({
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
    createdAt: { type: Date, default: Date.now }
});
export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
//# sourceMappingURL=Lead.js.map