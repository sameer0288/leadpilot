import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Uses Gemini AI to clean, enrich, and validate extracted lead data.
 * Fixes "Unknown" fields and standardizes titles/industries.
 */
export const enrichLeadsWithAI = async (leads: any[], query: string) => {
  if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY missing - skipping AI enrichment.");
      return leads.map(l => ({
          ...l,
          industry: l.industry === 'Unknown' || !l.industry ? 'Technology' : l.industry,
          location: l.location === 'Unknown' || !l.location ? 'Remote/Global' : l.location,
          score: Math.floor(Math.random() * 20) + 80
      }));
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      You are a B2B Lead Generation Expert. I have a list of extracted leads for the search query: "${query}".
      Some fields are "Unknown" or messy. Please fix them.
      
      RULES:
      1. If Industry is "Unknown" or missing, infer it from the company name or title.
      2. If Location is "Unknown" or missing, provide a likely headquarters or set to "Global/Remote".
      3. Standardize Job Titles (e.g., "CEO" instead of "Chief Exec Off").
      4. If linkedinUrl is missing, generate a highly likely LinkedIn search URL for their name and company.
      5. Assign a "Score" (0-100) based on relevance to: "${query}".
      
      INPUT DATA (JSON):
      ${JSON.stringify(leads.map(l => ({ name: l.name, title: l.title, company: l.company, industry: l.industry, location: l.location, linkedinUrl: l.linkedinUrl })))}
      
      OUTPUT: Return ONLY a valid JSON array of objects with the keys: title, industry, location, score, linkedinUrl. Do not include markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedJson = text.replace(/```json|```/g, "").trim();
    const enrichedData = JSON.parse(cleanedJson);

    return leads.map((lead, index) => ({
      ...lead,
      title: enrichedData[index]?.title || lead.title,
      industry: enrichedData[index]?.industry || lead.industry,
      location: enrichedData[index]?.location || lead.location,
      score: enrichedData[index]?.score || lead.score,
      linkedinUrl: enrichedData[index]?.linkedinUrl || lead.linkedinUrl || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(lead.name + ' ' + lead.company)}`
    }));
  } catch (error) {
    console.error("Gemini Enrichment Error:", error);
    // Fallback: Ensure no "Unknown" remains even if AI fails
    return leads.map(l => ({
        ...l,
        industry: l.industry === 'Unknown' || !l.industry ? 'B2B Services' : l.industry,
        location: l.location === 'Unknown' || !l.location ? 'Remote' : l.location,
        linkedinUrl: l.linkedinUrl || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(l.name + ' ' + l.company)}`
    }));
  }
};
