import { usePublisherStore } from '../stores';
import { ProfileView as SharedProfileView } from '@linkedin-job-applier/shared';
import { useToast } from './ui/Toast';
import { useState } from 'react';

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

  return (
    <SharedProfileView
      profile={profile}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      title="Meu Perfil do LinkedIn"
      subtitle="Veja os dados profissionais sincronizados do seu LinkedIn"
    />
  );
}
