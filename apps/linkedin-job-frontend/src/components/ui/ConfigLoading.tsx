import { RefreshCw } from 'lucide-react';

export function ConfigLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-slate-50">
      <RefreshCw className="animate-spin text-slate-400" size={32} />
    </div>
  );
}
