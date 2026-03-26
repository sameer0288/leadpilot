'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const LeadsPage = () => {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            // Updated to use the correct API URL from env with fallback
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const response = await fetch(`${baseUrl}/api/jobs`);
            if (response.ok) {
                const data = await response.json();
                setJobs(data.jobs || []);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-12 lg:py-20">
            {/* Header Section */}
            <div className="mb-16">
               <div className="px-4 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-full inline-flex items-center gap-2 mb-6">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                 </span>
                 <span className="text-[10px] font-black text-sky-500 uppercase tracking-[0.3em]">Search Archives</span>
               </div>
               <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">Intelligence Logs</h1>
               <p className="text-xl text-zinc-600 font-bold mt-6 italic">
                 Reviewing {jobs.length} autonomous search nodes stored in leadpilot_db.
               </p>
            </div>

            {/* Logs Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {Array(4).fill(0).map((_, i) => (
                      <div key={i} className="h-48 bg-white/[0.02] border border-white/5 rounded-[32px] animate-pulse"></div>
                   ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jobs.length > 0 ? jobs.map((job, i) => (
                        <Link 
                            key={job._id || i} 
                            href={`/search?jobId=${job._id}`}
                            className="bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/5 p-8 rounded-[40px] group transition-all duration-300 hover:border-sky-500/30 hover:shadow-2xl hover:scale-[1.02] flex flex-col items-start"
                        >
                            <div className="w-full flex justify-between items-center mb-6">
                                <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/10 group-hover:bg-sky-500/10 group-hover:border-sky-500/20 transition-all">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-600 group-hover:text-sky-500 transition-colors">
                                        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                                    </svg>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${job.status === 'completed' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20 shadow-lg shadow-emerald-500/5' : job.status === 'running' ? 'bg-sky-500/5 text-sky-500 border-sky-500/20 animate-pulse' : 'bg-red-500/5 text-red-500 border-red-500/20'}`}>
                                    {job.status}
                                </div>
                            </div>
                            
                            <h3 className="text-2xl lg:text-3xl font-black text-white tracking-tight uppercase italic mb-3 group-hover:text-sky-500 transition-colors">
                                {job.query || "Agent Discovery"}
                            </h3>
                            
                            <div className="mt-auto flex items-center gap-4 text-[10px] font-black text-zinc-700 uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <span className="text-sky-500">{job.totalFound || 0}</span> Leads
                                </div>
                                <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full"></div>
                                <div className="flex items-center gap-2">
                                    <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </Link>
                    )) : (
                        <div className="col-span-full py-40 text-center text-zinc-800 font-black uppercase tracking-[0.5em] border border-dashed border-white/5 rounded-[56px] bg-white/[0.01]">
                            The vault is currently empty
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LeadsPage;
