interface SearchParams {
    industry?: string;
    location?: string;
    funding_stage?: string;
    headcount?: string;
    count: number;
}
export declare const executeLeadSearch: (jobId: string, query: string, params: SearchParams) => Promise<void>;
export {};
//# sourceMappingURL=tinyfish.d.ts.map