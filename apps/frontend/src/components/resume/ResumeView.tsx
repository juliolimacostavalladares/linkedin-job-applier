import { useEffect } from 'react';
import { 
  RefreshCw, 
  Briefcase, 
  GraduationCap, 
  Building, 
  User, 
  AlertCircle, 
  Edit3, 
  Check
} from 'lucide-react';
import type { ResumeState } from '../../stores';
import { ProfileView, type ProfileData } from '@linkedin-job-applier/shared';

interface ResumeViewProps {
  resume: ResumeState;
}

export function ResumeView({ resume }: ResumeViewProps) {
  const {
    resumeText, setResumeText,
    name, headline, photoUrl, about, experiences, education,
    isFetchingProfile, profileError,
    isEditingResume, setIsEditingResume,
    saveResume, fetchProfile,
    profileId,
    resumeFilename,
  } = resume;

  useEffect(() => {
    // Auto fetch profile details on mount if they aren't loaded yet
    if (!name) {
      fetchProfile();
    }
  }, [name, fetchProfile]);

  const profile: ProfileData = {
    profileId,
    name,
    headline,
    photoUrl,
    about,
    experiences,
    education,
    resumeText,
    resumeFilename,
  };

  return (
    <ProfileView
      profile={profile}
      isFetchingProfile={isFetchingProfile}
      profileError={profileError}
      isEditingResume={isEditingResume}
      onRefresh={() => fetchProfile(true)}
      onSaveResume={saveResume}
      onEditToggle={() => setIsEditingResume(!isEditingResume)}
      onResumeTextChange={setResumeText}
    />
  );
}
