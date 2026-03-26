import axios from 'axios';
import Job from '../models/Job.js';
import Lead from '../models/Lead.js';
export const executeLeadSearch = async (jobId, query, params) => {
    try {
        const job = await Job.findById(jobId);
        if (!job)
            return;
        job.status = 'running';
        job.logs.push(`Starting autonomous agent for query: "${query}"`);
        await job.save();
        // In a real scenario, this would make long-running calls to the TinyFish API.
        // For this demo, we simulate the agent's behavior to provide a realistic experience.
        const platforms = ['LinkedIn People Search', 'Crunchbase', 'AngelList'];
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        job.logs.push(`Navigating to ${platform}...`);
        await job.save();
        await delay(2000);
        job.logs.push(`Parsing query into structure: ${JSON.stringify(params)}`);
        await job.save();
        await delay(1500);
        job.logs.push(`Handling pagination and extracting leads...`);
        await job.save();
        const targetCount = params.count || 10;
        for (let i = 0; i < targetCount; i++) {
            // Simulate real-world delay for each extraction
            await delay(Math.random() * 800 + 400);
            const newLead = new Lead({
                jobId,
                name: generateMockName(),
                title: generateMockTitle(params.industry),
                company: generateMockCompany(),
                linkedinUrl: `https://linkedin.com/in/mocklead${Math.floor(Math.random() * 10000)}`,
                website: `https://mockcompany${Math.floor(Math.random() * 1000)}.com`,
                industry: params.industry || 'Technology',
                location: params.location || 'Global',
                score: Math.floor(Math.random() * 20) + 80 // 80-100 score
            });
            await newLead.save();
            job.totalFound += 1;
            if (i % 3 === 0) {
                job.logs.push(`Extracted lead: ${newLead.name} from ${newLead.company}`);
                await job.save();
            }
        }
        job.logs.push(`Agent task completed successfully. Extracted ${targetCount} leads.`);
        job.status = 'completed';
        await job.save();
    }
    catch (error) {
        console.error('Agent error:', error);
        const job = await Job.findById(jobId);
        if (job) {
            job.status = 'failed';
            job.logs.push(`Agent encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            await job.save();
        }
    }
};
const delay = (ms) => new Promise(res => setTimeout(res, ms));
// Mock Data Generators for the demo
const generateMockName = () => {
    const firsts = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Jamie', 'Morgan', 'Sam', 'Drew', 'Avery'];
    const lasts = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    return `${firsts[Math.floor(Math.random() * firsts.length)]} ${lasts[Math.floor(Math.random() * lasts.length)]}`;
};
const generateMockTitle = (industry) => {
    const defaultTitles = ['CEO', 'CTO', 'VP of Engineering', 'Director of Sales', 'Founder', 'Head of Product', 'CMO'];
    if (industry?.toLowerCase().includes('fintech')) {
        return ['VP of Finance', 'Head of Payments', 'Chief Risk Officer', 'Fintech Founder'][Math.floor(Math.random() * 4)];
    }
    return defaultTitles[Math.floor(Math.random() * defaultTitles.length)];
};
const generateMockCompany = () => {
    const prefixes = ['Innovate', 'Tech', 'Cloud', 'Data', 'Smart', 'Next', 'Apex', 'Nova', 'Quantum', 'Synapse'];
    const suffixes = ['Corp', 'Systems', 'Solutions', 'Networks', 'Dynamics', 'AI', 'Soft', 'Labs', 'Analytics', 'Technologies'];
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
};
//# sourceMappingURL=tinyfish.js.map