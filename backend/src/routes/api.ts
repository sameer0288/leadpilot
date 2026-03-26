import express from 'express';
import { executeLeadSearch } from '../services/tinyfish.js';
import Job from '../models/Job.js';
import Lead from '../models/Lead.js';

const router = express.Router();

router.post('/search', async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) return res.status(400).json({ error: 'Query is required' });
  
      let params = { industry: 'B2B/Tech', location: 'Global', count: 10 };
  
      const newJob = new Job({ query, status: 'pending', totalFound: 0, logs: [], params });
      await newJob.save();
  
      executeLeadSearch(newJob._id.toString(), query, params);
      res.json({ jobId: newJob._id });
    } catch (error) {
      res.status(500).json({ error: 'Failed to start search' });
    }
});

router.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch search history' });
  }
});

router.get('/job/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    const leads = await Lead.find({ jobId: req.params.id }).sort({ createdAt: -1 });
    res.json({ job, leads });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job details' });
  }
});

router.get('/leads', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const total = await Lead.countDocuments({});
    const leads = await Lead.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json({ 
      leads, 
      pagination: { 
        total, 
        page, 
        pages: Math.ceil(total / limit), 
        hasNext: skip + limit < total 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// CSV Export: Removed LinkedIn URL and Email as requested
router.get('/export', async (req, res) => {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    const header = ['Name', 'Title', 'Company', 'Industry', 'Location', 'Score'];
    const csvRows = leads.map(l => [
      l.name, 
      l.title, 
      l.company, 
      l.industry, 
      l.location, 
      l.score
    ].map(f => `"${f ?? ''}"`).join(','));
    
    res.header('Content-Type', 'text/csv')
       .attachment('leadpilot-discovery.csv')
       .send([header.join(','), ...csvRows].join('\n'));
  } catch (error) {
    res.status(500).json({ error: 'Export failed' });
  }
});

export default router;
