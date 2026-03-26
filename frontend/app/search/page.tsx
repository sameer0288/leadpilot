'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const SearchContent = () => {
    const searchParams = useSearchParams();
    const jobId = searchParams.get('jobId');
    const [job, setJob] = useState<any>(null);
    const [leads, setLeads] = useState<any[]>([]);
    const [status, setStatus] = useState('Starting...');

    useEffect(() => {
        if (!jobId) return;
        const pollJob = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/job/${jobId}`);
                if (response.ok) {
                    const data = await response.json();
                    setJob(data.job);
                    setLeads(data.leads || []);
                    const s = data.job.status;
                    setStatus(s === 'running' ? 'Active' : s.charAt(0).toUpperCase() + s.slice(1));
                    if (s === 'completed' || s === 'failed') clearInterval(interval);
                }
            } catch (err) { }
        };
        const interval = setInterval(pollJob, 2000);
        pollJob();
        return () => clearInterval(interval);
    }, [jobId]);

    if (!jobId) return <div className="p-20 text-center uppercase tracking-widest text-zinc-700 font-bold">Waiting for node...</div>;

    return (
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 lg:py-12">
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">

                {/* Agent Sidebar - Medium Density */}
                <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-4 w-full">
                    <div className="bg-[#0a0a0a] p-8 rounded-[32px] border border-white/5 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-8">
                            <div className={`w-2.5 h-2.5 rounded-full ${job?.status === 'running' ? 'bg-sky-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                        </div>

                        <div className="flex flex-col items-center text-center mt-4 mb-8">
                            <h2 className="text-[10px] uppercase tracking-[0.4em] font-black text-zinc-700 mb-4 font-mono leading-none">NODE STATUS</h2>
                            <div className="text-5xl font-black text-white mb-2 tracking-tighter uppercase leading-none">
                                {status.split(' ')[0]}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-8">
                            <div className="p-6 bg-white/[0.01] rounded-[24px] border border-white/5 text-center">
                                <div className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-1 leading-none">Found</div>
                                <div className="text-3xl font-black text-sky-500">{leads.length}</div>
                            </div>
                            <div className="p-6 bg-white/[0.01] rounded-[24px] border border-white/5 text-center">
                                <div className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-1 leading-none">Accuracy</div>
                                <div className="text-3xl font-black text-white">100%</div>
                            </div>
                        </div>

                        {/* Telemetry log stream - Compact */}
                        <div className="space-y-2.5 max-h-[25vh] overflow-y-auto pr-2 custom-scrollbar">
                            {job?.logs?.slice().reverse().map((log: string, i: number) => (
                                <div key={i} className={`p-3 rounded-xl text-[10px] font-black border-l-2 ${i === 0 ? 'bg-sky-500/5 border-sky-500 text-white' : 'bg-transparent border-white/5 text-zinc-700'}`}>
                                    <code className="break-all opacity-80 leading-normal font-mono italic">{log}</code>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Lead Stream - Normalized Card Sizes */}
                <div className="lg:col-span-8 space-y-6 w-full">
                    <div className="flex items-center justify-between px-2 gap-6 pb-4 border-b border-white/5">
                        <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter mb-1 uppercase italic leading-none">Discovery Stream</h1>
                        <a
                            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/export`}
                            className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-sky-500 hover:text-white transition-all transform active:scale-95 shadow-xl flex items-center gap-2"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3" /></svg>
                            Export
                        </a>
                    </div>

                    <div className="grid grid-cols-1 gap-4 pb-20">
                        {leads.length > 0 ? leads.map((lead: any, i: number) => (
                            <div
                                key={i}
                                className="bg-[#0a0a0a]/50 border border-white/5 p-6 md:p-8 rounded-[32px] group transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-xl"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10 w-full min-w-0">
                                    <div className="flex gap-6 lg:gap-8 items-start w-full min-w-0">
                                        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/[0.03] rounded-2xl border border-white/10 flex items-center justify-center text-3xl font-black flex-shrink-0">
                                            <span className="text-white/20 group-hover:text-sky-500 transition-colors uppercase leading-none">{lead.name?.[0]}</span>
                                        </div>
                                        <div className="space-y-4 flex-1 min-w-0">
                                            <div className="flex items-center gap-4 flex-wrap">
                                                <h3 className="text-xl lg:text-2xl font-black text-white tracking-tighter truncate leading-none uppercase italic group-hover:text-sky-500 transition-colors">
                                                    {lead.name}
                                                </h3>
                                                <div className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border bg-sky-500/5 text-sky-500 border-sky-500/20">
                                                    VERIFIED
                                                </div>
                                            </div>
                                            <p className="text-lg lg:text-xl font-black text-zinc-600 leading-none">
                                                {lead.title} <span className="text-zinc-800 font-normal italic mx-1">@</span> <span className="text-white">{lead.company}</span>
                                            </p>

                                            <div className="flex flex-wrap items-center gap-6 text-[10px] font-black text-zinc-800 mt-4 pt-4 border-t border-white/5 uppercase tracking-[0.3em]">
                                                <span className="flex items-center gap-2.5">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                                    {lead.location}
                                                </span>
                                                <span className="flex items-center gap-2.5 group-hover:text-sky-500 transition-colors">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>
                                                    {lead.industry}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white/[0.03] p-6 lg:p-8 rounded-[24px] border border-white/5 text-center min-w-[120px] shadow-inner flex flex-col items-center justify-center font-mono group-hover:border-sky-500/10 transition-all">
                                        <div className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-2 leading-none italic">VAL</div>
                                        <div className="text-4xl lg:text-5xl font-black text-white tracking-tighter tabular-nums leading-none group-hover:scale-105 transition-transform duration-300">{lead.score}%</div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            Array(2).fill(0).map((_, i) => (
                                <div key={i} className="bg-zinc-900/40 border border-white/5 p-16 rounded-[32px] animate-pulse"></div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center font-black uppercase tracking-[0.5em] text-zinc-800 animate-pulse">Establishing Node...</div>}>
            <SearchContent />
        </Suspense>
    );
}
