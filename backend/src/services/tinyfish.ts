import axios from 'axios';
import Job from '../models/Job.js';
import Lead from '../models/Lead.js';
import { enrichLeadsWithAI } from './gemini.js';

interface SearchParams {
  industry?: string;
  location?: string;
  count: number;
}

const TINYFISH_API_BASE = process.env.TINYFISH_API_BASE || 'https://agent.tinyfish.ai';
const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const inferTinyFishTask = (query: string, params: SearchParams) => {
  const qStr = params.industry !== 'Unknown' ? `${params.industry} professionals in ${params.location !== 'Unknown' ? params.location : 'Global'}` : query;
  
  // Real-world LinkedIn Discovery via TinyFish Agent
  const url = 'https://www.google.com/search?q=' + encodeURIComponent(`site:linkedin.com/in/ "${params.industry || ''}" ${params.location || ''}`);
  const goal = `Navigate to LinkedIn results and extract the first ${params.count || 10} leads. For each, extract: Full Name, Job Title, Company, LinkedIn URL, and Location. Return as a clean JSON array of objects.`;

  return { url, goal };
};

const normalizeExtractionToLeads = (jobId: string, result: any, params: SearchParams) => {
  let items = [] as any[];
  if (!result) return [];

  if (Array.isArray(result)) items = result;
  else if (result.leads) items = result.leads;
  else if (result.results) items = result.results;
  else if (typeof result === 'object') {
    const firstArr = Object.values(result).find(v => Array.isArray(v));
    if (firstArr) items = firstArr as any[];
    else items = [result];
  }

  return items.map((item) => ({
      jobId,
      name: item.name || item.person || item.full_name || 'Lead discovered',
      title: item.title || item.role || item.position || 'Professional',
      company: item.company || item.organization || 'Unknown Corp',
      linkedinUrl: item.linkedinUrl || item.profile_url || item.url || '',
      website: item.website || '',
      industry: item.industry || params.industry || 'Technology',
      location: item.location || item.city || params.location || 'Remote',
      about: item.about || '',
      score: Number(item.score || 85)
  }));
};

export const executeLeadSearch = async (jobId: string, query: string, params: SearchParams, targetUrl?: string) => {
  try {
    const job = await Job.findById(jobId);
    if (!job) return;

    job.status = 'running';
    job.logs.push(`🚀 Agent Sequence Initialized: ${query}`);
    job.logs.push(`📡 Protocol: TinyFish Web-Grounded Discovery...`);
    await job.save();

    if (!TINYFISH_API_KEY) {
      job.logs.push('⚠️ TINYFISH_API_KEY missing - running AI Simulation...');
      await simulateLeadSearch(job, params, query);
      return;
    }

    const task = inferTinyFishTask(query, params);
    job.logs.push(`🌐 Navigating to Live Web: ${task.url}`);
    await job.save();

    const response = await axios.post(
      `${TINYFISH_API_BASE}/v1/automation/run`,
      {
        url: targetUrl || task.url,
        goal: task.goal,
        browser_profile: 'lite',
        api_integration: 'leadpilot',
      },
      {
        headers: { 'Content-Type': 'application/json', 'X-API-Key': TINYFISH_API_KEY },
        timeout: 240000,
      }
    );

    const tinyfishRun = response.data;
    if (tinyfishRun.status === 'COMPLETED' && tinyfishRun.result) {
      const rawLeads = normalizeExtractionToLeads(jobId, tinyfishRun.result, params);
      job.logs.push(`🧠 Processing Raw Data via Gemini 1.5 Flash...`);
      await job.save();

      const enriched = await enrichLeadsWithAI(rawLeads, query);
      for (const data of enriched) {
        await new Lead(data).save();
        job.totalFound += 1;
        if (job.totalFound % 2 === 0) job.logs.push(`✅ Captured: ${data.name} @ ${data.company}`);
      }
      job.status = 'completed';
    } else {
      throw new Error(tinyfishRun.error || 'Agent execution failed');
    }
    await job.save();

  } catch (error) {
    const job = await Job.findById(jobId);
    if (job) {
      job.status = 'failed';
      job.logs.push(`❌ Agent Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      await job.save();
    }
  }
};

const simulateLeadSearch = async (job: any, params: SearchParams, query: string) => {
  job.logs.push(`🕵️ Initializing Virtual Browser Session...`);
  await job.save();
  await delay(1500);

  const rawMockLeads = [];
  const targetCount = params.count || 10;
  
  for (let i = 0; i < targetCount; i++) {
    const name = generateMockName();
    rawMockLeads.push({
      jobId: job._id,
      name,
      title: generateMockTitle(),
      company: generateMockCompany(),
      linkedinUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(name)}`,
      website: '',
      industry: 'Unknown',
      location: 'Unknown',
      score: 50,
    });
  }

  job.logs.push(`🔍 Scan Complete. Perfecting ${rawMockLeads.length} items with AI...`);
  await job.save();

  const enriched = await enrichLeadsWithAI(rawMockLeads, query);
  for (const data of enriched) {
    await new Lead(data).save();
    job.totalFound += 1;
  }

  job.logs.push(`✨ Execution Complete. ${job.totalFound} Leads Secured.`);
  job.status = 'completed';
  await job.save();
};

const generateMockName = () => {
    const list = ['Alex Rivers', 'Jordan Smith', 'Taylor Vane', 'Morgan Lee', 'Chris Gray', 'Sam Thorne', 'Casey Bell', 'Drew Quinn', 'Sloane West', 'Parker Reed'];
    return list[Math.floor(Math.random() * list.length)];
};

const generateMockTitle = () => {
    const titles = ['Founder & CEO', 'Chief Technology Officer', 'Head of Growth', 'VP Engineering', 'Product Director'];
    return titles[Math.floor(Math.random() * titles.length)];
};

const generateMockCompany = () => {
    const companies = ['Stellar AI', 'Nexus Labs', 'Quantum Flow', 'Hyperion Tech', 'Vortex Digital', 'Aether Finance'];
    return companies[Math.floor(Math.random() * companies.length)];
};
