import { usePublisherStore } from '../stores';
import { ProfileView as SharedProfileView } from '@linkedin-job-applier/shared';
import { useToast } from './ui/Toast';
import { useState, useEffect } from 'react';

export function ProfileView() {
  const { profile, fetchProfile } = usePublisherStore();
  const { success: showToastSuccess, error: showToastError } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchProfile();
      showToastSuccess('Dados do perfil atualizados com sucesso!');
    } catch {
      showToastError('Falha ao atualizar dados do perfil.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-fetch profile on mount if not loaded
  useEffect(() => {
    if (!profile) {
      fetchProfile();
    }
  }, [profile, fetchProfile]);

  return (
    <SharedProfileView
      profile={profile}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
    />
  );
}
