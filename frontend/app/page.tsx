'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (data.jobId) {
        router.push(`/search?jobId=${data.jobId}`);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return <div className="min-h-screen bg-[#030303]" />;

  return (
    <div className="relative px-6 flex flex-col items-center justify-center pt-24 pb-32">
      {/* Premium Badge */}
      <div className="mb-12">
        <div className="relative rounded-full px-5 py-2 text-xs font-black tracking-[0.15em] uppercase text-sky-500 border border-sky-500/20 bg-sky-500/5 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          Next-Gen AI Browser Agent
        </div>
      </div>
      
      {/* Hero Header */}
      <div className="text-center max-w-4xl mb-16 px-4">
        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9] text-white">
          Find any lead. <br />
          <span className="text-sky-500 tracking-tighter italic">Autonomously.</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed">
          Skip manual scraping. Our autonomous browser agents navigate LinkedIn, Crunchbase, and 
          company websites to find, extract, and verify your ideal target leads.
        </p>
      </div>

      {/* Main Search Input */}
      <div className="w-full max-w-3xl px-4">
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute bg-white/[0.03] border border-white/10 rounded-[2.2rem] p-2 flex items-center shadow-2xl backdrop-blur-3xl w-full">
            <div className="pl-6 text-zinc-500">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Find 30 funded fintech startups in London..."
              className="bg-transparent border-none focus:outline-none text-lg md:text-xl w-full text-white placeholder:text-zinc-600 px-6 py-4 font-bold"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-black hover:bg-sky-500 hover:text-white px-10 h-[64px] rounded-[1.8rem] text-sm font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? 'Starting...' : 'Search'}
            </button>
          </div>
        </form>
        
        {/* Suggestion Tokens */}
        <div className="mt-28 flex flex-wrap justify-center gap-3">
          <span className="text-xs font-black text-zinc-500 py-3 uppercase tracking-widest mr-2">Try:</span>
          {["Fintech Startups in India", "SF SaaS Founders", "HealthTech CEO's"].map((s, i) => (
            <button
              key={i}
              onClick={() => setQuery(`Find 30 ${s}`)}
              className="px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/5 text-[11px] font-black text-zinc-500 hover:text-white hover:border-sky-500/40 hover:bg-sky-500/5 transition-all uppercase tracking-widest"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl px-4">
        {[
          { label: 'Extraction', val: '99.8%', color: 'text-sky-500' },
          { label: 'Latency', val: '< 60s', color: 'text-white' },
          { label: 'Verified', val: 'Real-time', color: 'text-sky-500' }
        ].map((s, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center justify-center hover:bg-white/[0.04] transition-all">
            <div className={`text-5xl font-black mb-2 tracking-tighter ${s.color}`}>{s.val}</div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
