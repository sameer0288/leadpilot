'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: search }),
      });
      if (res.ok) {
        const { jobId } = await res.json();
        router.push(`/search?jobId=${jobId}`);
      }
    } catch (err) { }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#030303]/70 backdrop-blur-3xl">
      <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between gap-8">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-10 h-10 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20 transition-all group-hover:rotate-12">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
          </div>
          <span className="text-xl font-black text-white tracking-tighter uppercase italic">LeadPilot</span>
        </Link>

        {/* Global Navbar Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative group">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads across the web..."
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 px-6 pl-12 text-sm font-bold text-white placeholder-zinc-700 focus:outline-none focus:border-sky-500/50 transition-all"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          </div>
        </form>

        <div className="flex items-center gap-6 flex-shrink-0">
          <Link href="/leads" className="text-[11px] font-black uppercase tracking-widest text-zinc-600 hover:text-sky-500">Lead</Link>
          <Link href="/" className="text-[11px] font-black uppercase tracking-widest text-zinc-600 hover:text-sky-500">Search</Link>
        </div>
      </div>
    </nav>
  );
}
