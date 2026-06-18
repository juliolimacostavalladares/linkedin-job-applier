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
  const { fetchPosts } = usePublisherStore();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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
        <main className="flex-1 flex overflow-hidden relative">
          {activeTab === 'dashboard' && (
            <DashboardView 
              onEditPost={handleEditPost} 
              onNavigateToCreate={() => setActiveTab('create')} 
            />
          )}
          {activeTab === 'create' && (
            <CreatePostView 
              editingPost={editingPost} 
              onClearEdit={handleClearEdit}
              onNavigateToDashboard={() => setActiveTab('dashboard')}
            />
          )}
          {activeTab === 'analytics' && <AnalyticsView />}
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
