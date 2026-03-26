import mongoose, { Document } from 'mongoose';
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
    createdAt: Date;
}
declare const _default: mongoose.Model<any, {}, {}, {}, any, any, any>;
export default _default;
//# sourceMappingURL=Lead.d.ts.map