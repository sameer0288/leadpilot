import express from 'express';
import { executeLeadSearch } from '../services/tinyfish.js';
import { enrichTargetedLead } from '../services/leadEnricher.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Job from '../models/Job.js';
import Lead from '../models/Lead.js';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// ... existing /search route ...
router.post('/search', async (req, res) => {
    try {
      const { query, targetUrl } = req.body;
      if (!query) return res.status(400).json({ error: 'Query is required' });
  
      let params = { industry: 'Unknown', location: 'Unknown', count: 10 };
  
      if (process.env.GEMINI_API_KEY) {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const prompt = `Parse: "${query}". Return valid JSON: {"industry": String, "location": String, "count": Number}`;
          const result = await model.generateContent(prompt);
          const cleaned = result.response.text().replace(/```json|```/g, "").trim();
          params = { ...params, ...JSON.parse(cleaned) };
        } catch (err) {}
      }
  
      const newJob = new Job({ query, status: 'pending', totalFound: 0, logs: [], params });
      await newJob.save();
  
      executeLeadSearch(newJob._id.toString(), query, params, targetUrl);
      res.json({ jobId: newJob._id });
    } catch (error) {
      res.status(500).json({ error: 'Failed to start search' });
    }
});

// Targeted enrichment route (On-Click)
router.post('/lead/:id/enrich', async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ error: 'Lead not found' });

        const enriched = await enrichTargetedLead(lead._id, lead.toObject());
        
        // Update database with perfected data
        const updated = await Lead.findByIdAndUpdate(req.params.id, enriched, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Enrichment failed' });
    }
});

router.get('/job/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    const leads = await Lead.find({ jobId: req.params.id }).sort({ createdAt: -1 });
    res.json({ job, leads });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

router.get('/leads', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const total = await Lead.countDocuments({});
    const leads = await Lead.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json({ leads, pagination: { total, page, pages: Math.ceil(total / limit), hasNext: skip + limit < total } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

router.get('/export', async (req, res) => {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    const header = ['Name', 'Title', 'Company', 'Industry', 'Location', 'LinkedIn URL', 'Email', 'Score'];
    const csvRows = leads.map(l => [l.name, l.title, l.company, l.industry, l.location, l.linkedinUrl, l.email, l.score].map(f => `"${f ?? ''}"`).join(','));
    res.header('Content-Type', 'text/csv').attachment('leads.csv').send([header.join(','), ...csvRows].join('\n'));
  } catch (error) {
    res.status(500).json({ error: 'Export failed' });
  }
});

export default router;
