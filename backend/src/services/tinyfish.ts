import Job from '../models/Job.js';
import Lead from '../models/Lead.js';
import axios from 'axios';

interface SearchParams {
  industry?: string;
  location?: string;
  count: number;
}

const TINYFISH_API_BASE = process.env.TINYFISH_API_BASE || 'https://agent.tinyfish.ai';
const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Clean normalization: No Gemini, No Hunter. Pure Agent Extraction.
const normalizeLeadData = (item: any, jobId: string, params: SearchParams) => ({
    jobId,
    name: item.name || item.person || item.full_name || 'Lead discovered',
    title: item.title || item.role || item.position || 'Professional',
    company: item.company || item.organization || 'Independent',
    linkedinUrl: item.linkedinUrl || item.profile_url || item.url || '#',
    email: item.email || 'Contact Private',
    website: item.website || '',
    industry: item.industry || params.industry || 'B2B/Tech',
    location: item.location || item.city || params.location || 'Distributed',
    score: Number(item.score || 85),
    enriched: true // Marked true as we're skipping separate enrichment
});

export const executeLeadSearch = async (jobId: string, query: string, params: SearchParams) => {
  try {
    const job = await Job.findById(jobId);
    if (!job) return;

    job.status = 'running';
    job.logs.push(`🚀 Agent Core Initialized`);
    await job.save();

    if (!TINYFISH_API_KEY) {
      job.logs.push('⚠️ API Key missing - Simulation Mode');
      await simulateLeadSearch(job, params);
      return;
    }

    // Pure TinyFish Extraction Task
    const response = await axios.post(
      `${TINYFISH_API_BASE}/v1/automation/run`,
      {
        url: `https://www.google.com/search?q=site:linkedin.com/in/ ${encodeURIComponent(query)}`,
        goal: `Extract name, title, company, profile link, and location for ${params.count || 5} leads. Return as JSON array.`,
        browser_profile: 'lite',
      },
      {
        headers: { 'Content-Type': 'application/json', 'X-API-Key': TINYFISH_API_KEY },
        timeout: 120000,
      }
    );

    const result = response.data.result;
    const items = Array.isArray(result) ? result : (result.leads || result.results || []);

    for (const item of items) {
        const leadData = normalizeLeadData(item, jobId, params);
        await new Lead(leadData).save();
        job.totalFound += 1;
        job.logs.push(`✅ Captured: ${leadData.name}`);
    }

    job.status = 'completed';
    job.logs.push(`✨ Execution Complete. ${job.totalFound} Leads Secured.`);
    await job.save();

  } catch (error) {
    const job = await Job.findById(jobId);
    if (job) {
      job.status = 'failed';
      job.logs.push(`❌ Agent Error: ${error instanceof Error ? error.message : 'Disconnected'}`);
      await job.save();
    }
  }
};

const simulateLeadSearch = async (job: any, params: SearchParams) => {
  await delay(2000);
  const mockNames = ['Alex Rivers', 'Jordan Smith', 'Taylor Vane', 'Morgan Lee', 'Chris Gray'];
  
  for (const name of mockNames.slice(0, params.count || 5)) {
    const leadData = normalizeLeadData({ 
        name, 
        title: 'Founder & CEO', 
        company: 'Hyperion Tech',
        linkedinUrl: `https://linkedin.com/search/results/people/?keywords=${encodeURIComponent(name)}`
    }, job._id, params);
    
    await new Lead(leadData).save();
    job.totalFound += 1;
    job.logs.push(`✅ Captured: ${name}`);
    await job.save();
    await delay(500);
  }

  job.status = 'completed';
  job.logs.push(`✨ Simulation Complete`);
  await job.save();
};
