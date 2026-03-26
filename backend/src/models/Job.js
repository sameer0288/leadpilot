import mongoose, { Schema, Document } from 'mongoose';
const JobSchema = new Schema({
    query: { type: String, required: true },
    status: { type: String, enum: ['pending', 'running', 'completed', 'failed'], default: 'pending' },
    totalFound: { type: Number, default: 0 },
    logs: [{ type: String }],
}, { timestamps: true });
export default mongoose.models.Job || mongoose.model('Job', JobSchema);
//# sourceMappingURL=Job.js.map