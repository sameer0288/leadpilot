import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const HUNTER_API_KEY = process.env.HUNTER_API_KEY;

export const enrichTargetedLead = async (leadId: string, leadData: any) => {
    let emailFound = leadData.email;
    let refinedData = { ...leadData };

    // 1. Mandatory AI Deep-Dive for Website & LinkedIn
    if (process.env.GEMINI_API_KEY) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Research professional profile for: ${leadData.name} at ${leadData.company}.
            Find and provide:
            1. Direct LinkedIn Profile URL (e.g. linkedin.com/in/...).
            2. Official Company Website URL.
            3. Corporate Email Domain.
            4. Industry & Headquarters.
            
            Current Data: ${JSON.stringify(leadData)}
            
            OUTPUT: JSON ONLY: {
              "linkedinUrl": "...",
              "website": "...",
              "emailDomain": "...",
              "industry": "...",
              "location": "...",
              "about": "..."
            }`;
            
            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json|```/g, "").trim();
            const aiUpdate = JSON.parse(text);
            
            refinedData = { ...refinedData, ...aiUpdate };
        } catch (err) {
            console.error("Gemini failed, applying smart search heuristics");
        }
    }

    // 2. Hunter.io Email Recovery
    if (HUNTER_API_KEY && leadData.company) {
        try {
            const domain = refinedData.emailDomain || refinedData.website?.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
            if (domain && domain.includes('.')) {
                const res = await axios.get(`https://api.hunter.io/v2/email-finder?domain=${domain}&first_name=${leadData.name.split(' ')[0]}&last_name=${leadData.name.split(' ').slice(1).join(' ')}&api_key=${HUNTER_API_KEY}`);
                if (res.data?.data?.email) emailFound = res.data.data.email;
            }
        } catch (err) {}
    }

    // Failsafe LinkedIn Search URL if still missing
    const finalLinkedin = refinedData.linkedinUrl && refinedData.linkedinUrl.includes('linkedin.com') 
        ? refinedData.linkedinUrl 
        : `https://www.google.com/search?q=${encodeURIComponent(leadData.name + ' ' + leadData.company + ' LinkedIn official profile')}&btnI=1`;

    return { 
        ...refinedData, 
        email: emailFound || (refinedData.email && refinedData.email !== 'Searching...' ? refinedData.email : 'Contact Private'),
        linkedinUrl: finalLinkedin,
        enriched: true
    };
};
