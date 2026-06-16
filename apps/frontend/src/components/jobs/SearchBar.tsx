import { RefreshCw } from 'lucide-react';

interface SearchBarProps {
  onRefresh: () => void;
  loading: boolean;
}

export function SearchBar({ onRefresh, loading }: SearchBarProps) {
  return (
    <div className="p-6 pb-2 shrink-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Vagas</h1>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-10 h-10 bg-[#1a1f2e] border border-white/5 rounded-full flex items-center justify-center shadow-sm text-slate-400 hover:text-blue-400 font-semibold transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search jobs, skills..."
          className="w-full bg-[#0a0d14] border border-white/10 rounded-full py-3.5 pl-12 pr-4 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-500"
        />
        <svg className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
    </div>
  );
}
