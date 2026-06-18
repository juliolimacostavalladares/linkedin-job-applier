import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CreatePostView } from './components/CreatePostView';
import { AnalyticsView } from './components/AnalyticsView';
import { ProfileView } from './components/ProfileView';
import { ToastProvider } from './components/ui/Toast';
import { FilePenLine, LayoutDashboard, BarChart3, Sun, Moon, User } from 'lucide-react';
import { useThemeStore, usePublisherStore } from './stores';

function AppLayout() {
  const { theme, toggleTheme } = useThemeStore();
  const { fetchPosts, fetchCredentialsStatus, fetchProfile, setSelectedPost } = usePublisherStore();
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    fetchPosts();
    fetchCredentialsStatus();
    fetchProfile();
  }, [fetchPosts, fetchCredentialsStatus, fetchProfile]);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-bg-app font-sans text-text-primary overflow-hidden p-0 md:p-4 lg:p-5 transition-colors duration-200">
      <div className="flex flex-col md:flex-row flex-1 bg-bg-card md:rounded-xl overflow-hidden shadow-subtle border border-border-color relative w-full max-w-[1500px] mx-auto transition-colors duration-200">
        
        <Sidebar />

        {/* Mobile Header */}
        <header className="md:hidden h-14 bg-bg-card border-b border-border-color flex items-center justify-between px-4 shrink-0 z-20 transition-colors duration-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-blue rounded-md flex items-center justify-center">
              <span className="text-white font-black text-sm tracking-tighter">in</span>
            </div>
            <span className="font-bold text-base tracking-tight text-text-primary">Publisher</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Link 
              to="/dashboard" 
              className={`w-8 h-8 rounded-md shrink-0 flex items-center justify-center ${currentPath === '/dashboard' || currentPath === '/' ? 'bg-brand-blue text-white' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}`}
              title="Dashboard"
            >
              <LayoutDashboard size={16} />
            </Link>
            <Link 
              to="/create" 
              onClick={() => setSelectedPost(null)}
              className={`w-8 h-8 rounded-md shrink-0 flex items-center justify-center ${currentPath.startsWith('/create') ? 'bg-brand-blue text-white' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}`}
              title="Criar"
            >
              <FilePenLine size={16} />
            </Link>
            <Link 
              to="/analytics" 
              className={`w-8 h-8 rounded-md shrink-0 flex items-center justify-center ${currentPath === '/analytics' ? 'bg-brand-blue text-white' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}`}
              title="Métricas"
            >
              <BarChart3 size={16} />
            </Link>
            <Link 
              to="/profile" 
              className={`w-8 h-8 rounded-md shrink-0 flex items-center justify-center ${currentPath === '/profile' ? 'bg-brand-blue text-white' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}`}
              title="Perfil"
            >
              <User size={16} />
            </Link>
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
          <div className="flex-1 flex overflow-hidden relative">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardView />} />
              <Route path="/create" element={<CreatePostView />} />
              <Route path="/analytics" element={<AnalyticsView />} />
              <Route path="/profile" element={<ProfileView />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </ToastProvider>
  );
}
