import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CreatePostView } from './components/CreatePostView';
import { AnalyticsView } from './components/AnalyticsView';
import { ToastProvider } from './components/ui/Toast';
import type { LinkedInPost } from './types';
import { FilePenLine, LayoutDashboard, BarChart3, Sun, Moon } from 'lucide-react';
import { useThemeStore, usePublisherStore } from './stores';

function AppLayout() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'analytics'>('dashboard');
  const [editingPost, setEditingPost] = useState<LinkedInPost | null>(null);
  const { theme, toggleTheme } = useThemeStore();
  const { fetchPosts, fetchCredentialsStatus, hasCredentials } = usePublisherStore();

  useEffect(() => {
    fetchPosts();
    fetchCredentialsStatus();
  }, [fetchPosts, fetchCredentialsStatus]);

  const handleEditPost = (post: LinkedInPost) => {
    setEditingPost(post);
    setActiveTab('create');
  };

  const handleClearEdit = () => {
    setEditingPost(null);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-bg-app font-sans text-text-primary overflow-hidden p-0 md:p-4 lg:p-5 transition-colors duration-200">
      <div className="flex flex-col md:flex-row flex-1 bg-bg-card md:rounded-xl overflow-hidden shadow-subtle border border-border-color relative w-full max-w-[1500px] mx-auto transition-colors duration-200">
        
        <Sidebar activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); if (tab !== 'create') handleClearEdit(); }} />

        {/* Mobile Header */}
        <header className="md:hidden h-14 bg-bg-card border-b border-border-color flex items-center justify-between px-4 shrink-0 z-20 transition-colors duration-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-blue rounded-md flex items-center justify-center">
              <span className="text-white font-black text-sm tracking-tighter">in</span>
            </div>
            <span className="font-bold text-base tracking-tight text-text-primary">Publisher</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => { setActiveTab('dashboard'); handleClearEdit(); }} 
              className={`w-8 h-8 rounded-md shrink-0 flex items-center justify-center ${activeTab === 'dashboard' ? 'bg-brand-blue text-white' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}`}
              title="Dashboard"
            >
              <LayoutDashboard size={16} />
            </button>
            <button 
              onClick={() => { setActiveTab('create'); }} 
              className={`w-8 h-8 rounded-md shrink-0 flex items-center justify-center ${activeTab === 'create' ? 'bg-brand-blue text-white' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}`}
              title="Criar"
            >
              <FilePenLine size={16} />
            </button>
            <button 
              onClick={() => { setActiveTab('analytics'); handleClearEdit(); }} 
              className={`w-8 h-8 rounded-md shrink-0 flex items-center justify-center ${activeTab === 'analytics' ? 'bg-brand-blue text-white' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}`}
              title="Métricas"
            >
              <BarChart3 size={16} />
            </button>
            <button 
              onClick={toggleTheme} 
              className="w-8 h-8 ml-1 rounded-md flex items-center justify-center text-text-secondary border border-border-color bg-bg-hover"
              title="Alternar Tema"
            >
              {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} />}
            </button>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {!hasCredentials && (
            <div className="bg-amber-500/10 dark:bg-amber-500/5 border-b border-border-color px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-amber-700 dark:text-amber-400 shrink-0">
              <div className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5 sm:mt-0">⚠️</span>
                <span>
                  <b>LinkedIn não conectado:</b> Para habilitar postagens reais no LinkedIn, abra a extensão do Chrome, altere a URL do servidor para <code className="bg-bg-hover border border-border-color px-1 py-0.5 rounded font-mono select-all">http://localhost:3001</code> e clique em <b>Sincronizar</b>.
                </span>
              </div>
              <button 
                onClick={fetchCredentialsStatus} 
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded shrink-0 transition-colors shadow-sm cursor-pointer"
              >
                Verificar Conexão
              </button>
            </div>
          )}
          <div className="flex-1 flex overflow-hidden relative">
            {activeTab === 'dashboard' && (
              <DashboardView 
                onEditPost={handleEditPost} 
                onNavigateToCreate={() => setActiveTab('create')} 
              />
            )}
            {activeTab === 'create' && (
              <CreatePostView 
                key={editingPost?.id || 'new'}
                editingPost={editingPost} 
                onClearEdit={handleClearEdit}
                onNavigateToDashboard={() => setActiveTab('dashboard')}
              />
            )}
            {activeTab === 'analytics' && <AnalyticsView />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppLayout />
    </ToastProvider>
  );
}
