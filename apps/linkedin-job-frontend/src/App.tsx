import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore, useJobsStore } from './stores';
import JobsPage from './pages/JobsPage';
import ProfilePage from './pages/ProfilePage';
import ApplicationsPage from './pages/ApplicationsPage';
import { ConfigLoading } from './components/ui/ConfigLoading';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ToastProvider } from './components/ui/Toast';

function AppLayout() {
  const { config, loading: configLoading, fetchConfig } = useAuthStore();
  const { jobs, fetchJobs } = useJobsStore();

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  if (configLoading || !config) {
    return <ConfigLoading />;
  }

  if (!config.hasCredentials && jobs.length === 0) {
    return <WelcomeScreen onRefresh={() => window.location.reload()} />;
  }

  return (
    <Routes>
      <Route path="/" element={<JobsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/applications" element={<ApplicationsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
