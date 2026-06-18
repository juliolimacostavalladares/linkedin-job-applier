import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Globe, Clock } from 'lucide-react';
import { useJobsStore } from '../../stores/jobsStore';
import { Input } from '../ui/Input';

interface SearchBarProps {
  onRefresh: () => void;
  loading: boolean;
}

export function SearchBar({ onRefresh, loading }: SearchBarProps) {
  const { searchQuery, remoteFilter, past24hFilter, fetchJobs, setFilters } = useJobsStore();
  const [inputValue, setInputValue] = useState(searchQuery);

  // Sync input value when store's searchQuery changes (e.g. initial load)
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(inputValue, remoteFilter, past24hFilter);
  };

  const toggleRemote = () => {
    const newVal = !remoteFilter;
    setFilters({ remote: newVal });
    fetchJobs(inputValue, newVal, past24hFilter);
  };

  const togglePast24h = () => {
    const newVal = !past24hFilter;
    setFilters({ past24h: newVal });
    fetchJobs(inputValue, remoteFilter, newVal);
  };

  return (
    <div className="p-4 pb-3 shrink-0 border-b border-border-color transition-colors duration-200">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-lg font-bold text-text-primary">Vagas</h1>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-8 h-8 bg-bg-hover border border-border-color rounded-md flex items-center justify-center shadow-sm text-text-secondary hover:text-brand-blue disabled:opacity-50 transition-colors"
          title="Recarregar vagas"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      
      <form onSubmit={handleSearch} className="space-y-2.5">
        <Input
          type="text"
          value={inputValue}
          onChange={(val) => setInputValue(val)}
          placeholder="Pesquisar vagas..."
          className="py-1.5 text-xs rounded-md placeholder:text-text-secondary/40"
          startIcon={<Search className="w-3.5 h-3.5 text-text-secondary/60" />}
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggleRemote}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all duration-200 cursor-pointer ${
              remoteFilter
                ? 'bg-brand-blue/10 border-brand-blue text-brand-blue shadow-sm'
                : 'bg-transparent border-border-color text-text-secondary hover:bg-bg-hover'
            }`}
          >
            <Globe size={11} />
            Remota
          </button>

          <button
            type="button"
            onClick={togglePast24h}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all duration-200 cursor-pointer ${
              past24hFilter
                ? 'bg-brand-blue/10 border-brand-blue text-brand-blue shadow-sm'
                : 'bg-transparent border-border-color text-text-secondary hover:bg-bg-hover'
            }`}
          >
            <Clock size={11} />
            Últimas 24h
          </button>
        </div>
      </form>
    </div>
  );
}
