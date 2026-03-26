import express from 'express';
import { executeLeadSearch } from '../services/tinyfish.js';
import Job from '../models/Job.js';
import Lead from '../models/Lead.js';
const router = express.Router();
router.post('/search', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query)
            return res.status(400).json({ error: 'Query is required' });
        // In a full implementation, you'd use NLP or a prompt to extract params from the query.
        // For this demo, we mock the extraction.
        const params = {
            industry: query.toLowerCase().includes('fintech') ? 'Fintech' : 'Unknown',
            location: query.toLowerCase().includes('india') ? 'India' : 'Unknown',
            count: parseInt(query.match(/\d+/) ? query.match(/\d+/)[0] : '50', 10),
            funding_stage: query.toLowerCase().includes('funded') ? 'Funded' : 'Unknown',
            headcount: query.includes('<50') ? '<50' : 'Unknown'
        };
        const newJob = new Job({ query, status: 'pending', totalFound: 0, logs: [] });
        await newJob.save();
        // Start background task
        executeLeadSearch(newJob._id.toString(), query, params);
        res.json({ jobId: newJob._id, message: 'Agent search started' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to start search job' });
    }
});
router.get('/job/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job)
            return res.status(404).json({ error: 'Job not found' });
        // Also send recent leads
        const leads = await Lead.find({ jobId: req.params.id }).sort({ createdAt: -1 }).limit(10);
        res.json({ job, leads });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch job status' });
    }
});
router.get('/leads', async (req, res) => {
    try {
        const leads = await Lead.find({}).sort({ createdAt: -1 });
        res.json(leads);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
});
router.get('/export', async (req, res) => {
    try {
        const leads = await Lead.find({}).sort({ createdAt: -1 });
        const header = ['Name', 'Title', 'Company', 'Industry', 'Location', 'LinkedIn URL', 'Website', 'Score'];
        const csvRows = leads.map(lead => [
            lead.name, lead.title, lead.company, lead.industry, lead.location, lead.linkedinUrl, lead.website, lead.score
        ].map(field => `"${field ?? ''}"`).join(','));
        const csvContent = [header.join(','), ...csvRows].join('\n');
        res.header('Content-Type', 'text/csv');
        res.attachment('leads.csv');
        res.send(csvContent);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to export leads' });
    }
});
export default router;
//# sourceMappingURL=api.js.map