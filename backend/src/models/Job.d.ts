import mongoose, { Document } from 'mongoose';
export interface IJob extends Document {
    query: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    totalFound: number;
    logs: string[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<any, {}, {}, {}, any, any, any>;
export default _default;
//# sourceMappingURL=Job.d.ts.map