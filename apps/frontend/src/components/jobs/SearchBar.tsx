import { RefreshCw, Search } from 'lucide-react';

interface SearchBarProps {
  onRefresh: () => void;
  loading: boolean;
}

export function SearchBar({ onRefresh, loading }: SearchBarProps) {
  return (
    <div className="p-4 pb-2 shrink-0 border-b border-border-color transition-colors duration-200">
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
      
      <div className="relative">
        <input
          type="text"
          placeholder="Pesquisar vagas..."
          className="w-full bg-bg-input border border-border-color rounded-md py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue text-text-primary placeholder:text-text-secondary/40 transition-all"
        />
        <Search className="w-3.5 h-3.5 text-text-secondary/60 absolute left-2.5 top-2" />
      </div>
    </div>
  );
}
